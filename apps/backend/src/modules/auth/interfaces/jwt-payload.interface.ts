import { Role } from '@prisma/client';

/**
 * Claims embedded in both access and refresh JWTs.
 * `sid` is the Session.id — embedded in both tokens so the service can look up
 * and rotate the session record on refresh, and revoke it on logout.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  sid: string;
}
