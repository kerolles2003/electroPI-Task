import { ApiProperty } from '@nestjs/swagger';

import { CartItemResponse } from './cart-item.response';

/**
 * The caller's cart. An empty cart returns `items: []` with zero totals.
 */
export class CartResponse {
  @ApiProperty({ type: [CartItemResponse], description: 'Cart lines' })
  items!: CartItemResponse[];

  @ApiProperty({ example: 4999.98, description: 'Sum of all line totals' })
  subtotal!: number;

  @ApiProperty({ example: 2, description: 'Sum of all line quantities' })
  totalItems!: number;
}
