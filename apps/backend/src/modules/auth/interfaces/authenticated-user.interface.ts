import { Role } from '@prisma/client';

/**
 * The minimal identity attached to `request.user` after access-token auth.
 * `sessionId` maps to Session.id so logout can target the exact session.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  sessionId?: string;
}

/**
 * Variant attached after refresh-token auth — carries the presented raw
 * refresh token so the service can verify it against the stored hash.
 */
export interface RefreshTokenUser extends AuthenticatedUser {
  refreshToken: string;
}
