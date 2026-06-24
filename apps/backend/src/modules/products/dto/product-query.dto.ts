import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CATEGORY_SLUG_MAX_LENGTH } from '../../categories/constants/category.constant';
import { PRODUCT_SEARCH_MAX_LENGTH } from '../constants/product.constant';

/**
 * Coerces the `available` query string ('true'/'false', '1'/'0') into a boolean;
 * absent/empty stays undefined so it acts as "no availability filter".
 */
const toOptionalBoolean = ({ value }: { value: unknown }): unknown => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return value === 'true' || value === '1';
};

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search across nameEn and nameAr' })
  @IsOptional()
  @IsString()
  @MaxLength(PRODUCT_SEARCH_MAX_LENGTH)
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  @MaxLength(CATEGORY_SLUG_MAX_LENGTH)
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by availability', type: Boolean })
  @Transform(toOptionalBoolean)
  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
