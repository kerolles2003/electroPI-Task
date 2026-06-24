import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route (or controller) as public. JwtAccessGuard reads this metadata
 * key and bypasses access-token authentication for it.
 */
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
