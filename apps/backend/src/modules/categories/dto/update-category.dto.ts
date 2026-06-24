import { PartialType } from '@nestjs/swagger';

import { CreateCategoryDto } from './create-category.dto';

/**
 * All category fields are optional on update; provided fields are validated with
 * the same rules as creation.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
