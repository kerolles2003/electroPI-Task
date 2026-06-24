import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import { MIN_CART_ITEM_QUANTITY } from '../constants/cart.constant';

export class UpdateCartItemDto {
  @ApiProperty({ example: 3, minimum: MIN_CART_ITEM_QUANTITY, description: 'New absolute quantity for the line' })
  @Type(() => Number)
  @IsInt()
  @Min(MIN_CART_ITEM_QUANTITY)
  quantity!: number;
}
