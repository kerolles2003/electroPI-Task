import { NotFoundException } from '@nestjs/common';

/**
 * Raised when an authenticated token references a user that no longer exists.
 * Distinct from credential failures: the token was valid, the user is gone.
 */
export class UserNotFoundException extends NotFoundException {
  constructor() {
    super('User not found');
  }
}
