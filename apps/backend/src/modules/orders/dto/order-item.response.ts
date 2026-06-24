import { ApiProperty } from '@nestjs/swagger';

/**
 * Immutable snapshot of a purchased line — preserved even if the product is
 * later edited or deleted.
 */
export class OrderItemResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  id!: string;

  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k', nullable: true, description: 'Null if the product was deleted' })
  productId!: string | null;

  @ApiProperty({ example: 'MacBook Pro 16"' })
  productNameEn!: string;

  @ApiProperty({ example: 'ماك بوك برو 16 بوصة' })
  productNameAr!: string;

  @ApiProperty({ example: 2499.99 })
  unitPrice!: number;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: 4999.98 })
  lineTotal!: number;
}
