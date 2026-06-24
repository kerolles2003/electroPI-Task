import { NotFoundException } from '@nestjs/common';

import { CART_ITEM_NOT_FOUND_MESSAGE } from '../constants/cart-error.constant';

/**
 * Raised when a cart item does not exist within the caller's own cart. Used for
 * both missing items and items owned by a different cart, so existence is never
 * leaked across owners.
 */
export class CartItemNotFoundException extends NotFoundException {
  constructor() {
    super(CART_ITEM_NOT_FOUND_MESSAGE);
  }
}
