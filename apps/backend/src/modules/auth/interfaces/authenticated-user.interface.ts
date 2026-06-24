import { Role } from '@prisma/client';

/**
 * The minimal identity attached to `request.user` after access-token auth.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

/**
 * Variant attached after refresh-token auth — carries the presented raw
 * refresh token so the service can verify it against the stored hash.
 */
export interface RefreshTokenUser extends AuthenticatedUser {
  refreshToken: string;
}
