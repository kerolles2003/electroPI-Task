import { UnauthorizedException } from '@nestjs/common';

/**
 * Reusable 401 wrapper for the auth module. Provides a single base so all
 * authentication failures share consistent semantics; specific failures
 * (invalid credentials, invalid refresh token) extend it with their message.
 */
export class AuthUnauthorizedException extends UnauthorizedException {
  constructor(message = 'Unauthorized') {
    super(message);
  }
}
