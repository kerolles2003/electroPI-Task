import { ApiProperty } from '@nestjs/swagger';

import { PageMetaResponse } from '../../../common/dto/page-meta.response';
import { TopProductResponse } from './top-product.response';

export class TopProductsResponse {
  @ApiProperty({ type: [TopProductResponse], description: 'Products ranked by units sold' })
  items!: TopProductResponse[];

  @ApiProperty({ type: PageMetaResponse, description: 'Pagination metadata' })
  meta!: PageMetaResponse;
}
