import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { CookieOptions, Request, Response } from 'express';

import { GUEST_CART_COOKIE, GUEST_CART_COOKIE_MAX_AGE_MS } from '../constants/cart.constant';

/**
 * Centralizes guest-cart cookie handling, mirroring the auth CookieService so
 * controllers stay thin. Reuses the shared cookie security settings.
 */
@Injectable()
export class CartCookieService {
  constructor(private readonly config: ConfigService) {}

  read(req: Request): string | undefined {
    const token = req.cookies?.[GUEST_CART_COOKIE] as unknown;
    return typeof token === 'string' && token.length > 0 ? token : undefined;
  }

  set(res: Response, token: string): void {
    res.cookie(GUEST_CART_COOKIE, token, {
      ...this.baseOptions(),
      maxAge: GUEST_CART_COOKIE_MAX_AGE_MS,
    });
  }

  clear(res: Response): void {
    res.clearCookie(GUEST_CART_COOKIE, this.baseOptions());
  }

  generateToken(): string {
    return randomUUID();
  }

  private baseOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.getOrThrow<boolean>('cookies.secure'),
      sameSite: this.config.getOrThrow<CookieOptions['sameSite']>('cookies.sameSite'),
      path: '/',
    };
  }
}
