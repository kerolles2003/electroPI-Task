import { Request } from 'express';
import { JwtFromRequestFunction } from 'passport-jwt';

/**
 * Builds a passport-jwt extractor that reads a token from a named cookie.
 * Requires cookie-parser middleware (registered in main.ts).
 */
export const cookieExtractor =
  (cookieName: string): JwtFromRequestFunction =>
  (req: Request): string | null => {
    const token = req?.cookies?.[cookieName];
    return typeof token === 'string' ? token : null;
  };
