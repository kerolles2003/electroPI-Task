import { ApiProperty } from '@nestjs/swagger';

/**
 * Public representation of a category.
 */
export class CategoryResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  id!: string;

  @ApiProperty({ example: 'laptops' })
  slug!: string;

  @ApiProperty({ example: 'Laptops' })
  nameEn!: string;

  @ApiProperty({ example: 'أجهزة الكمبيوتر المحمولة' })
  nameAr!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  updatedAt!: Date;
}
