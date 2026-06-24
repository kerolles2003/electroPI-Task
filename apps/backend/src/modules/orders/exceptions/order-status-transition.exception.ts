import { ConflictException } from '@nestjs/common';

import { ORDER_ALREADY_TERMINAL_MESSAGE } from '../constants/order-error.constant';

/**
 * Raised on a forbidden status transition — specifically, attempting to change
 * an order that is already in a terminal state (DELIVERED or CANCELLED).
 */
export class OrderStatusTransitionException extends ConflictException {
  constructor() {
    super(ORDER_ALREADY_TERMINAL_MESSAGE);
  }
}
