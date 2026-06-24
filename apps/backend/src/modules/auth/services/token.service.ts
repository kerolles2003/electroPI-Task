import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { TokenPair } from '../types/token-pair.type';

/**
 * Signs access and refresh JWTs using independent secrets and TTLs.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('auth.accessSecret'),
        expiresIn: this.config.getOrThrow<string>('auth.accessTtl'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('auth.refreshSecret'),
        expiresIn: this.config.getOrThrow<string>('auth.refreshTtl'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
