import { ApiProperty } from '@nestjs/swagger';

import { PageMetaResponse } from '../../../common/dto/page-meta.response';
import { ProductResponse } from './product.response';

/**
 * Paginated list of products: the page of `items` plus its pagination `meta`.
 */
export class ProductListResponse {
  @ApiProperty({ type: [ProductResponse], description: 'Products on the current page' })
  items!: ProductResponse[];

  @ApiProperty({ type: PageMetaResponse, description: 'Pagination metadata' })
  meta!: PageMetaResponse;
}
