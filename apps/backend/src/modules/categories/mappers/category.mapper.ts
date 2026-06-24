import { Category } from '@prisma/client';

import { CategoryResponse } from '../dto/category.response';

/**
 * Maps the persisted Category entity to its public representation.
 */
export class CategoryMapper {
  static toResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      slug: category.slug,
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
