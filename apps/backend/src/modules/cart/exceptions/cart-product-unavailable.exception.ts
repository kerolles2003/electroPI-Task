import { ConflictException } from '@nestjs/common';

import { PRODUCT_UNAVAILABLE_MESSAGE } from '../constants/cart-error.constant';

/**
 * Raised when adding a product that exists but is currently not available.
 */
export class CartProductUnavailableException extends ConflictException {
  constructor() {
    super(PRODUCT_UNAVAILABLE_MESSAGE);
  }
}
