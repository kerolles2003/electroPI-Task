import { ApiProperty } from '@nestjs/swagger';

import { PageMetaResponse } from '../../../common/dto/page-meta.response';
import { TopCustomerResponse } from './top-customer.response';

export class TopCustomersResponse {
  @ApiProperty({ type: [TopCustomerResponse], description: 'Customers ranked by order count' })
  items!: TopCustomerResponse[];

  @ApiProperty({ type: PageMetaResponse, description: 'Pagination metadata' })
  meta!: PageMetaResponse;
}
