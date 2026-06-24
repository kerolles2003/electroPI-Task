import { BadRequestException } from '@nestjs/common';

import { EMPTY_CART_CHECKOUT_MESSAGE } from '../constants/order-error.constant';

export class CartEmptyException extends BadRequestException {
  constructor() {
    super(EMPTY_CART_CHECKOUT_MESSAGE);
  }
}
