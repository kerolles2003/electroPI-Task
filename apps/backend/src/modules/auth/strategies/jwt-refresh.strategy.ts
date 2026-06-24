import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWT_REFRESH_STRATEGY, REFRESH_TOKEN_COOKIE } from '../constants/auth.constants';
import { RefreshTokenUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { cookieExtractor } from './cookie-extractor';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, JWT_REFRESH_STRATEGY) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor(REFRESH_TOKEN_COOKIE)]),
      secretOrKey: config.getOrThrow<string>('auth.refreshSecret'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  // The raw refresh token travels through so the service can verify it
  // against the bcrypt hash stored in the Session row.
  validate(req: Request, payload: JwtPayload): RefreshTokenUser {
    const refreshToken = req?.cookies?.[REFRESH_TOKEN_COOKIE];
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sid,
      refreshToken: typeof refreshToken === 'string' ? refreshToken : '',
    };
  }
}
