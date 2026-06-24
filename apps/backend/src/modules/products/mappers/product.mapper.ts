import { CategoryMapper } from '../../categories/mappers/category.mapper';
import { ProductResponse } from '../dto/product.response';
import { ProductWithCategory } from '../repositories/product.repository';

/**
 * Maps the persisted Product entity (with its category) to its public
 * representation. Prisma's Decimal `price` is normalized to a JS number.
 */
export class ProductMapper {
  static toResponse(product: ProductWithCategory): ProductResponse {
    return {
      id: product.id,
      slug: product.slug,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      descriptionEn: product.descriptionEn,
      descriptionAr: product.descriptionAr,
      price: Number(product.price),
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      categoryId: product.categoryId,
      category: CategoryMapper.toResponse(product.category),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
