import { ApiProperty } from '@nestjs/swagger';

/**
 * Pagination envelope describing the current page relative to the full result
 * set. Returned alongside `items` in every paginated response.
 */
export class PageMetaResponse {
  @ApiProperty({ example: 1, description: 'Current page (1-based)' })
  readonly page: number;

  @ApiProperty({ example: 20, description: 'Items requested per page' })
  readonly limit: number;

  @ApiProperty({ example: 137, description: 'Total items matching the query' })
  readonly total: number;

  @ApiProperty({ example: 7, description: 'Total number of pages' })
  readonly totalPages: number;

  @ApiProperty({ example: true, description: 'Whether a next page exists' })
  readonly hasNext: boolean;

  @ApiProperty({ example: false, description: 'Whether a previous page exists' })
  readonly hasPrev: boolean;

  constructor(params: { page: number; limit: number; total: number }) {
    this.page = params.page;
    this.limit = params.limit;
    this.total = params.total;
    this.totalPages = params.limit > 0 ? Math.ceil(params.total / params.limit) : 0;
    this.hasNext = params.page < this.totalPages;
    this.hasPrev = params.page > 1;
  }
}
