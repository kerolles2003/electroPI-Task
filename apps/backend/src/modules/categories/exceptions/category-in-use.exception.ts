import { ConflictException } from '@nestjs/common';

/**
 * Raised when deleting a category that still has products. The Product→Category
 * relation uses onDelete: Restrict, so the database refuses the delete.
 */
export class CategoryInUseException extends ConflictException {
  constructor() {
    super('Category cannot be deleted while it still has products');
  }
}
