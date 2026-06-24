import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PageMetaResponse } from '../../common/dto/page-meta.response';
import { CategoryRepository } from '../categories/repositories/category.repository';
import { STORAGE_PROVIDER, StorageProvider } from '../../providers/storage/interfaces/storage-provider.interface';
import { ALLOWED_IMAGE_MIME_TYPES, PRODUCT_IMAGE_FOLDER } from './constants/product.constant';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductListResponse } from './dto/product-list.response';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponse } from './dto/product.response';
import { UpdateProductDto } from './dto/update-product.dto';
import { InvalidImageFileException } from './exceptions/invalid-image-file.exception';
import { ProductCategoryNotFoundException } from './exceptions/product-category-not-found.exception';
import { ProductNotFoundException } from './exceptions/product-not-found.exception';
import { ProductSlugConflictException } from './exceptions/product-slug-conflict.exception';
import { UploadedImage } from './interfaces/uploaded-image.interface';
import { ProductMapper } from './mappers/product.mapper';
import { ProductRepository } from './repositories/product.repository';

// Prisma error codes.
const PRISMA_UNIQUE_VIOLATION = 'P2002'; // duplicate slug
const PRISMA_RELATED_RECORD_MISSING = 'P2025'; // connected category not found
const PRISMA_FK_VIOLATION = 'P2003'; // invalid categoryId foreign key

@Injectable()
export class ProductsService {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  async findAll(query: ProductQueryDto): Promise<ProductListResponse> {
    let categoryId: string | undefined;

    // Filtering by an unknown category slug yields an empty page rather than 404.
    if (query.category) {
      const category = await this.categories.findBySlug(query.category);
      if (!category) {
        return this.emptyPage(query);
      }
      categoryId = category.id;
    }

    const { items, total } = await this.products.findManyPaginated({
      page: query.page,
      limit: query.limit,
      search: query.search,
      categoryId,
      isAvailable: query.available,
    });

    return {
      items: items.map((product) => ProductMapper.toResponse(product)),
      meta: new PageMetaResponse({ page: query.page, limit: query.limit, total }),
    };
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const product = await this.products.findBySlug(slug);
    if (!product) {
      throw new ProductNotFoundException();
    }

    return ProductMapper.toResponse(product);
  }

  async create(dto: CreateProductDto, image?: UploadedImage): Promise<ProductResponse> {
    // Fast-path checks; the DB constraints below are the actual guarantees.
    if (await this.products.findBySlug(dto.slug)) {
      throw new ProductSlugConflictException();
    }
    await this.assertCategoryExists(dto.categoryId);

    const imageUrl = image ? await this.uploadImage(dto.slug, image) : undefined;

    try {
      const product = await this.products.create({
        slug: dto.slug,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        descriptionEn: dto.descriptionEn,
        descriptionAr: dto.descriptionAr,
        price: new Prisma.Decimal(dto.price),
        imageUrl,
        isAvailable: dto.isAvailable,
        category: { connect: { id: dto.categoryId } },
      });

      return ProductMapper.toResponse(product);
    } catch (error) {
      throw this.normalizeWriteError(error);
    }
  }

  async update(id: string, dto: UpdateProductDto, image?: UploadedImage): Promise<ProductResponse> {
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new ProductNotFoundException();
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const clash = await this.products.findBySlug(dto.slug);
      if (clash && clash.id !== id) {
        throw new ProductSlugConflictException();
      }
    }

    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }

    const data: Prisma.ProductUpdateInput = {};
    if (dto.nameEn !== undefined) data.nameEn = dto.nameEn;
    if (dto.nameAr !== undefined) data.nameAr = dto.nameAr;
    if (dto.descriptionEn !== undefined) data.descriptionEn = dto.descriptionEn;
    if (dto.descriptionAr !== undefined) data.descriptionAr = dto.descriptionAr;
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.price !== undefined) data.price = new Prisma.Decimal(dto.price);
    if (dto.isAvailable !== undefined) data.isAvailable = dto.isAvailable;
    if (dto.categoryId !== undefined) data.category = { connect: { id: dto.categoryId } };

    if (image) {
      // Remove the previous Cloudinary asset before storing the replacement.
      await this.deleteImageIfPresent(existing.slug, existing.imageUrl);
      data.imageUrl = await this.uploadImage(dto.slug ?? existing.slug, image);
    }

    try {
      const product = await this.products.update(id, data);
      return ProductMapper.toResponse(product);
    } catch (error) {
      throw this.normalizeWriteError(error);
    }
  }

  async remove(id: string): Promise<void> {
    const existing = await this.products.findById(id);
    if (!existing) {
      throw new ProductNotFoundException();
    }

    // Remove the remote asset before dropping the database record.
    await this.deleteImageIfPresent(existing.slug, existing.imageUrl);
    await this.products.delete(id);
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await this.categories.findById(categoryId);
    if (!category) {
      throw new ProductCategoryNotFoundException();
    }
  }

  private imageKey(slug: string): string {
    return `${PRODUCT_IMAGE_FOLDER}/${slug}`;
  }

  private async uploadImage(slug: string, image: UploadedImage): Promise<string> {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(image.mimetype)) {
      throw new InvalidImageFileException();
    }

    return this.storage.upload(this.imageKey(slug), image.buffer);
  }

  /**
   * Best-effort removal of a product's Cloudinary asset via the StorageProvider.
   * Cleanup failures must not block the primary write, so errors are swallowed.
   */
  private async deleteImageIfPresent(slug: string, imageUrl: string | null): Promise<void> {
    if (!imageUrl) {
      return;
    }

    try {
      await this.storage.delete(this.imageKey(slug));
    } catch {
      // Intentionally ignored — orphaned remote assets are preferable to a
      // failed update/delete caused by transient storage errors.
    }
  }

  private emptyPage(query: ProductQueryDto): ProductListResponse {
    return {
      items: [],
      meta: new PageMetaResponse({ page: query.page, limit: query.limit, total: 0 }),
    };
  }

  /**
   * Translates known Prisma write failures into domain exceptions; unknown
   * errors propagate unchanged.
   */
  private normalizeWriteError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === PRISMA_UNIQUE_VIOLATION) {
        return new ProductSlugConflictException();
      }
      if (error.code === PRISMA_FK_VIOLATION || error.code === PRISMA_RELATED_RECORD_MISSING) {
        return new ProductCategoryNotFoundException();
      }
    }
    return error;
  }
}
