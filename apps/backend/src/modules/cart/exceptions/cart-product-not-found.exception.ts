import { NotFoundException } from '@nestjs/common';

import { PRODUCT_NOT_FOUND_MESSAGE } from '../constants/cart-error.constant';

export class CartProductNotFoundException extends NotFoundException {
  constructor() {
    super(PRODUCT_NOT_FOUND_MESSAGE);
  }
}
