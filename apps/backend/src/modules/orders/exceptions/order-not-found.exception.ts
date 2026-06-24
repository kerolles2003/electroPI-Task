import { NotFoundException } from '@nestjs/common';

import { ORDER_NOT_FOUND_MESSAGE } from '../constants/order-error.constant';

/**
 * Raised when an order does not exist or is not owned by the requester.
 * Returns 404 either way so ownership is never leaked.
 */
export class OrderNotFoundException extends NotFoundException {
  constructor() {
    super(ORDER_NOT_FOUND_MESSAGE);
  }
}
