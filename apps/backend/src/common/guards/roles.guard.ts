import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Request } from 'express';

import { AuthenticatedUser } from '../../modules/auth/interfaces/authenticated-user.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Authorizes a request against the roles declared via @Roles(). Relies on a
 * preceding authentication guard (JwtAccessGuard) having attached the user.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() on the route — authorization is not this guard's concern.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient permissions for this resource');
    }

    return true;
  }
}
