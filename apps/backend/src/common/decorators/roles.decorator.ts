import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * Metadata key carrying the roles allowed to invoke a route. Read by RolesGuard.
 */
export const ROLES_KEY = 'roles';

/**
 * Restricts a route (or controller) to the given roles. Must be paired with
 * JwtAccessGuard so `request.user` is populated before RolesGuard runs, e.g.:
 *
 *   @UseGuards(JwtAccessGuard, RolesGuard)
 *   @Roles(Role.ADMIN)
 */
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
