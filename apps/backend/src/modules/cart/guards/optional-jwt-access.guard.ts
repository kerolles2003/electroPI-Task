import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JWT_ACCESS_STRATEGY } from '../../auth/constants/auth.constants';

/**
 * Optional access-token authentication: attaches `request.user` when a valid
 * access cookie is present, but never rejects the request when it is missing or
 * invalid. Cart routes use this so the same endpoints serve both authenticated
 * users and anonymous guests.
 */
@Injectable()
export class OptionalJwtAccessGuard extends AuthGuard(JWT_ACCESS_STRATEGY) {
  // Override the default behavior (which throws on no user) to fall through to
  // an anonymous request instead.
  handleRequest(_err: unknown, user: unknown): any {
    return user || undefined;
  }
}
