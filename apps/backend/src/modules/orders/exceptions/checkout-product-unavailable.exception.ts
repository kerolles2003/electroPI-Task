import { ConflictException } from '@nestjs/common';

import { CHECKOUT_PRODUCT_UNAVAILABLE_MESSAGE } from '../constants/order-error.constant';

/**
 * Raised at checkout when one or more cart products are no longer available.
 */
export class CheckoutProductUnavailableException extends ConflictException {
  constructor() {
    super(CHECKOUT_PRODUCT_UNAVAILABLE_MESSAGE);
  }
}
