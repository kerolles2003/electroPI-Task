import { Role } from '@prisma/client';

/**
 * Claims embedded in both access and refresh JWTs.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}
