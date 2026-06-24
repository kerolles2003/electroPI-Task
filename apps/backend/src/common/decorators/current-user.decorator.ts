import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extracts the authenticated principal that a JWT guard attached to the request.
 * The concrete shape is provided by the call-site annotation
 * (AuthenticatedUser or RefreshTokenUser).
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.user;
});
