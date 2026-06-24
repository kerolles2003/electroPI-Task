import { NotFoundException } from '@nestjs/common';

import { ADDRESS_NOT_FOUND_MESSAGE } from '../constants/order-error.constant';

/**
 * Raised when the checkout address does not exist or does not belong to the
 * current user. Returns 404 either way so ownership is never leaked.
 */
export class AddressNotFoundException extends NotFoundException {
  constructor() {
    super(ADDRESS_NOT_FOUND_MESSAGE);
  }
}
