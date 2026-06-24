import { ApiProperty } from '@nestjs/swagger';

import { PageMetaResponse } from '../../../common/dto/page-meta.response';
import { OrderResponse } from './order.response';

/**
 * Paginated list of orders: the page of `items` plus its pagination `meta`.
 */
export class OrderListResponse {
  @ApiProperty({ type: [OrderResponse], description: 'Orders on the current page' })
  items!: OrderResponse[];

  @ApiProperty({ type: PageMetaResponse, description: 'Pagination metadata' })
  meta!: PageMetaResponse;
}
