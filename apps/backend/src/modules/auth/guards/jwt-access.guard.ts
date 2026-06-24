import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { JWT_ACCESS_STRATEGY } from '../constants/auth.constants';

@Injectable()
export class JwtAccessGuard extends AuthGuard(JWT_ACCESS_STRATEGY) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Routes (or controllers) marked @Public() skip access-token authentication.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return isPublic ? true : super.canActivate(context);
  }
}
