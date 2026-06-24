import { ApiProperty } from '@nestjs/swagger';

export class TopProductResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  productId!: string;

  @ApiProperty({ example: 'Wireless Headphones' })
  productName!: string;

  @ApiProperty({ example: 128 })
  quantitySold!: number;
}
