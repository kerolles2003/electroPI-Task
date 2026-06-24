import { ApiProperty } from '@nestjs/swagger';

import { PageMetaResponse } from '../../../common/dto/page-meta.response';
import { RecentOrderResponse } from './recent-order.response';

export class RecentOrdersResponse {
  @ApiProperty({ type: [RecentOrderResponse], description: 'Latest orders on the current page' })
  items!: RecentOrderResponse[];

  @ApiProperty({ type: PageMetaResponse, description: 'Pagination metadata' })
  meta!: PageMetaResponse;
}
