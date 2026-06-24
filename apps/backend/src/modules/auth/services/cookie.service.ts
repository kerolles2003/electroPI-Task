import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../constants/auth.constants';

/**
 * Centralizes HTTP-only auth cookie handling so controllers stay thin.
 */
@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService) {}

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...this.baseOptions(),
      maxAge: this.config.getOrThrow<number>('cookies.accessMaxAgeMs'),
    });
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.baseOptions(),
      maxAge: this.config.getOrThrow<number>('cookies.refreshMaxAgeMs'),
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.baseOptions());
    res.clearCookie(REFRESH_TOKEN_COOKIE, this.baseOptions());
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
