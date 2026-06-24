import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponse } from './dto/category.response';
import { CategoryInUseException } from './exceptions/category-in-use.exception';
import { CategoryNotFoundException } from './exceptions/category-not-found.exception';
import { CategorySlugConflictException } from './exceptions/category-slug-conflict.exception';
import { CategoryMapper } from './mappers/category.mapper';
import { CategoryRepository } from './repositories/category.repository';

// Prisma error codes.
const PRISMA_UNIQUE_VIOLATION = 'P2002'; // duplicate slug
const PRISMA_FK_VIOLATION = 'P2003'; // category still referenced by products

@Injectable()
export class CategoriesService {
  constructor(private readonly categories: CategoryRepository) {}

  async findAll(): Promise<CategoryResponse[]> {
    const categories = await this.categories.findMany();
    return categories.map((category) => CategoryMapper.toResponse(category));
  }

  async findBySlug(slug: string): Promise<CategoryResponse> {
    const category = await this.categories.findBySlug(slug);
    if (!category) {
      throw new CategoryNotFoundException();
    }

    return CategoryMapper.toResponse(category);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponse> {
    // Fast-path check; the unique constraint is the actual guarantee.
    if (await this.categories.findBySlug(dto.slug)) {
      throw new CategorySlugConflictException();
    }

    try {
      const category = await this.categories.create({
        slug: dto.slug,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      });

      return CategoryMapper.toResponse(category);
    } catch (error) {
      throw this.normalizeWriteError(error);
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponse> {
    const existing = await this.categories.findById(id);
    if (!existing) {
      throw new CategoryNotFoundException();
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const clash = await this.categories.findBySlug(dto.slug);
      if (clash && clash.id !== id) {
        throw new CategorySlugConflictException();
      }
    }

    try {
      const category = await this.categories.update(id, {
        slug: dto.slug,
        nameEn: dto.nameEn,
        nameAr: dto.nameAr,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      });

      return CategoryMapper.toResponse(category);
    } catch (error) {
      throw this.normalizeWriteError(error);
    }
  }

  async remove(id: string): Promise<void> {
    const existing = await this.categories.findById(id);
    if (!existing) {
      throw new CategoryNotFoundException();
    }

    try {
      await this.categories.delete(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_FK_VIOLATION
      ) {
        throw new CategoryInUseException();
      }
      throw error;
    }
  }

  /**
   * Translates known Prisma write failures into domain exceptions; unknown
   * errors propagate unchanged.
   */
  private normalizeWriteError(error: unknown): unknown {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_UNIQUE_VIOLATION
    ) {
      return new CategorySlugConflictException();
    }
    return error;
  }
}
