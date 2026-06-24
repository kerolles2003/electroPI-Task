import { AuthUnauthorizedException } from './unauthorized.exception';

export class InvalidRefreshTokenException extends AuthUnauthorizedException {
  constructor() {
    super('Invalid or expired refresh token');
  }
}
