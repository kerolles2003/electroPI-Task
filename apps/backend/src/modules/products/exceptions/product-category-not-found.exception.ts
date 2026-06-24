import { BadRequestException } from '@nestjs/common';

/**
 * Raised when a product references a categoryId that does not exist.
 */
export class ProductCategoryNotFoundException extends BadRequestException {
  constructor() {
    super('The referenced category does not exist');
  }
}
