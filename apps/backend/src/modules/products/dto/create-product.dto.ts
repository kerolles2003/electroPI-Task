import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { SLUG_MESSAGE, SLUG_REGEX } from '../../../common/constants/slug.constant';
import {
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_DESCRIPTION_MIN_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  PRODUCT_NAME_MIN_LENGTH,
  PRODUCT_PRICE_MAX,
  PRODUCT_PRICE_MAX_DECIMALS,
  PRODUCT_PRICE_MIN,
  PRODUCT_SLUG_MAX_LENGTH,
} from '../constants/product.constant';

/**
 * Parses booleans arriving as multipart/form-data text fields ('true'/'false',
 * '1'/'0'). Empty values become undefined so optional defaults still apply.
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

export class CreateProductDto {
  @ApiProperty({ example: 'MacBook Pro 16"', minLength: PRODUCT_NAME_MIN_LENGTH, maxLength: PRODUCT_NAME_MAX_LENGTH })
  @IsString()
  @MinLength(PRODUCT_NAME_MIN_LENGTH)
  @MaxLength(PRODUCT_NAME_MAX_LENGTH)
  nameEn!: string;

  @ApiProperty({
    example: 'ماك بوك برو 16 بوصة',
    minLength: PRODUCT_NAME_MIN_LENGTH,
    maxLength: PRODUCT_NAME_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PRODUCT_NAME_MIN_LENGTH)
  @MaxLength(PRODUCT_NAME_MAX_LENGTH)
  nameAr!: string;

  @ApiProperty({
    example: 'High-performance laptop with M3 Pro chip.',
    minLength: PRODUCT_DESCRIPTION_MIN_LENGTH,
    maxLength: PRODUCT_DESCRIPTION_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PRODUCT_DESCRIPTION_MIN_LENGTH)
  @MaxLength(PRODUCT_DESCRIPTION_MAX_LENGTH)
  descriptionEn!: string;

  @ApiProperty({
    example: 'حاسوب محمول عالي الأداء بمعالج M3 Pro.',
    minLength: PRODUCT_DESCRIPTION_MIN_LENGTH,
    maxLength: PRODUCT_DESCRIPTION_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PRODUCT_DESCRIPTION_MIN_LENGTH)
  @MaxLength(PRODUCT_DESCRIPTION_MAX_LENGTH)
  descriptionAr!: string;

  @ApiProperty({ example: 'macbook-pro-16', maxLength: PRODUCT_SLUG_MAX_LENGTH, description: SLUG_MESSAGE })
  @IsString()
  @MaxLength(PRODUCT_SLUG_MAX_LENGTH)
  @Matches(SLUG_REGEX, { message: SLUG_MESSAGE })
  slug!: string;

  @ApiProperty({ example: 2499.99, minimum: PRODUCT_PRICE_MIN, maximum: PRODUCT_PRICE_MAX })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: PRODUCT_PRICE_MAX_DECIMALS })
  @Min(PRODUCT_PRICE_MIN)
  @Max(PRODUCT_PRICE_MAX)
  price!: number;

  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k', description: 'Owning category id' })
  @IsString()
  @MinLength(1)
  categoryId!: string;

  @ApiPropertyOptional({ default: true })
  @Transform(toOptionalBoolean)
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Product image file (uploaded to Cloudinary). Field name: "image".',
  })
  // Documentation-only: the file is read via @UploadedFile(), never from the body.
  image?: unknown;
}
