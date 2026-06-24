import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

import { MIN_CART_ITEM_QUANTITY } from '../constants/cart.constant';

export class AddCartItemDto {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k', description: 'Product to add' })
  @IsString()
  @MinLength(1)
  productId!: string;

  @ApiProperty({ example: 1, minimum: MIN_CART_ITEM_QUANTITY, description: 'Units to add (increments an existing line)' })
  @Type(() => Number)
  @IsInt()
  @Min(MIN_CART_ITEM_QUANTITY)
  quantity!: number;
}
