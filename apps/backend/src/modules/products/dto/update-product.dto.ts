import { PartialType } from '@nestjs/swagger';

import { CreateProductDto } from './create-product.dto';

/**
 * All product fields are optional on update; provided fields are validated with
 * the same rules as creation. A new image file (field "image") replaces the
 * existing one when supplied.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}
