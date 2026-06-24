import { ConflictException } from '@nestjs/common';

export class ProductSlugConflictException extends ConflictException {
  constructor() {
    super('A product with this slug already exists');
  }
}
