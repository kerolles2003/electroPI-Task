import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { MailModule } from '../../providers/mail/mail.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuditRepository } from './repositories/audit.repository';
import { SessionRepository } from './repositories/session.repository';
import { AuditService } from './services/audit.service';
import { CookieService } from './services/cookie.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  // TokenService supplies per-token secrets/TTLs; a default secret is registered
  // so any incidental JwtService.verify() call is never left unconfigured.
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('auth.accessSecret'),
      }),
    }),
    UsersModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionRepository,
    AuditRepository,
    AuditService,
    HashingService,
    TokenService,
    CookieService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
