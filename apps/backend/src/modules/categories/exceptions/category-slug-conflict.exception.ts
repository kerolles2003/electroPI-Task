import { ConflictException } from '@nestjs/common';

export class CategorySlugConflictException extends ConflictException {
  constructor() {
    super('A category with this slug already exists');
  }
}
