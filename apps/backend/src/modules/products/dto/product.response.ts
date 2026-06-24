import { ApiProperty } from '@nestjs/swagger';

import { CategoryResponse } from '../../categories/dto/category.response';

/**
 * Public representation of a product. `price` is serialized as a number; the
 * owning category is always embedded.
 */
export class ProductResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  id!: string;

  @ApiProperty({ example: 'macbook-pro-16' })
  slug!: string;

  @ApiProperty({ example: 'MacBook Pro 16"' })
  nameEn!: string;

  @ApiProperty({ example: 'ماك بوك برو 16 بوصة' })
  nameAr!: string;

  @ApiProperty({ example: 'High-performance laptop with M3 Pro chip.' })
  descriptionEn!: string;

  @ApiProperty({ example: 'حاسوب محمول عالي الأداء بمعالج M3 Pro.' })
  descriptionAr!: string;

  @ApiProperty({ example: 2499.99 })
  price!: number;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/products/macbook-pro-16.jpg', nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  categoryId!: string;

  @ApiProperty({ type: CategoryResponse })
  category!: CategoryResponse;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  updatedAt!: Date;
}
