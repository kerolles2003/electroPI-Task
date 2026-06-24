import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

import { SLUG_MESSAGE, SLUG_REGEX } from '../../../common/constants/slug.constant';
import {
  CATEGORY_NAME_MAX_LENGTH,
  CATEGORY_NAME_MIN_LENGTH,
  CATEGORY_SLUG_MAX_LENGTH,
  CATEGORY_SORT_ORDER_DEFAULT,
  CATEGORY_SORT_ORDER_MIN,
} from '../constants/category.constant';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Laptops', minLength: CATEGORY_NAME_MIN_LENGTH, maxLength: CATEGORY_NAME_MAX_LENGTH })
  @IsString()
  @MinLength(CATEGORY_NAME_MIN_LENGTH)
  @MaxLength(CATEGORY_NAME_MAX_LENGTH)
  nameEn!: string;

  @ApiProperty({
    example: 'أجهزة الكمبيوتر المحمولة',
    minLength: CATEGORY_NAME_MIN_LENGTH,
    maxLength: CATEGORY_NAME_MAX_LENGTH,
  })
  @IsString()
  @MinLength(CATEGORY_NAME_MIN_LENGTH)
  @MaxLength(CATEGORY_NAME_MAX_LENGTH)
  nameAr!: string;

  @ApiProperty({ example: 'laptops', maxLength: CATEGORY_SLUG_MAX_LENGTH, description: SLUG_MESSAGE })
  @IsString()
  @MaxLength(CATEGORY_SLUG_MAX_LENGTH)
  @Matches(SLUG_REGEX, { message: SLUG_MESSAGE })
  slug!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    default: CATEGORY_SORT_ORDER_DEFAULT,
    minimum: CATEGORY_SORT_ORDER_MIN,
    description: 'Ascending display order',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(CATEGORY_SORT_ORDER_MIN)
  sortOrder?: number;
}
