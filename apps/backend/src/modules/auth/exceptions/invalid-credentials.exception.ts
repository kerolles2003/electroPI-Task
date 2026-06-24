import { AuthUnauthorizedException } from './unauthorized.exception';

export class InvalidCredentialsException extends AuthUnauthorizedException {
  constructor() {
    super('Invalid email or password');
  }
}
