import { ApiProperty } from '@nestjs/swagger';

/**
 * Lightweight product summary embedded in a cart line (no category — the cart
 * does not need the full product contract).
 */
export class CartItemProductResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  id!: string;

  @ApiProperty({ example: 'macbook-pro-16' })
  slug!: string;

  @ApiProperty({ example: 'MacBook Pro 16"' })
  nameEn!: string;

  @ApiProperty({ example: 'ماك بوك برو 16 بوصة' })
  nameAr!: string;

  @ApiProperty({ example: 2499.99 })
  price!: number;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/products/macbook-pro-16.jpg', nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ example: true })
  isAvailable!: boolean;
}

export class CartItemResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  id!: string;

  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  productId!: string;

  @ApiProperty({ example: 2 })
  quantity!: number;

  @ApiProperty({ example: 2499.99, description: 'Unit price snapshot at read time' })
  unitPrice!: number;

  @ApiProperty({ example: 4999.98, description: 'unitPrice × quantity' })
  lineTotal!: number;

  @ApiProperty({ type: CartItemProductResponse })
  product!: CartItemProductResponse;
}
