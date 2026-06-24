import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditAction, Prisma, User } from '@prisma/client';
import { randomUUID } from 'crypto';

import { UserRepository } from '../users/repositories/user.repository';
import { MAIL_PROVIDER, MailProvider } from '../../providers/mail/interfaces/mail-provider.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionResponse } from './dto/session.response';
import { UserProfileResponse } from './dto/user-profile.response';
import { EmailAlreadyRegisteredException } from './exceptions/email-already-registered.exception';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { InvalidRefreshTokenException } from './exceptions/invalid-refresh-token.exception';
import { InvalidResetTokenException } from './exceptions/invalid-reset-token.exception';
import { InvalidVerificationTokenException } from './exceptions/invalid-verification-token.exception';
import { SessionNotFoundException } from './exceptions/session-not-found.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { EmailAlreadyVerifiedException } from './exceptions/email-already-verified.exception';
import { AuthResult } from './interfaces/auth-result.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SessionContext } from './interfaces/session-context.interface';
import { SessionMapper } from './mappers/session.mapper';
import { UserMapper } from './mappers/user.mapper';
import { AuditRepository } from './repositories/audit.repository';
import { SessionRepository } from './repositories/session.repository';
import { AuditService } from './services/audit.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { TokenPair } from './types/token-pair.type';

const PRISMA_UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly audit: AuditService,
    private readonly hashing: HashingService,
    private readonly tokens: TokenService,
    private readonly config: ConfigService,
    @Inject(MAIL_PROVIDER) private readonly mail: MailProvider,
  ) {}

  async register(dto: RegisterDto, context: SessionContext = {}): Promise<AuthResult> {
    const email = dto.email.toLowerCase();

    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyRegisteredException();
    }

    const passwordHash = await this.hashing.hash(dto.password);

    let user: User;
    try {
      user = await this.users.create({
        email,
        passwordHash,
        fullName: dto.name,
        preferredLocale: dto.preferredLocale,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_UNIQUE_VIOLATION
      ) {
        throw new EmailAlreadyRegisteredException();
      }
      throw error;
    }

    await this.audit.log(AuditAction.REGISTER_SUCCESS, user.id);
    await this.dispatchVerificationEmail(user);

    return this.issueSession(user, context);
  }

  async login(dto: LoginDto, context: SessionContext = {}): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email.toLowerCase());

    if (!user || !(await this.hashing.compare(dto.password, user.passwordHash))) {
      await this.audit.log(AuditAction.LOGIN_FAILED, user?.id, {
        emailHash: this.hashing.sha256(dto.email.toLowerCase()),
      });
      throw new InvalidCredentialsException();
    }

    await this.audit.log(AuditAction.LOGIN_SUCCESS, user.id);
    return this.issueSession(user, context);
  }

  async refresh(
    userId: string,
    sessionId: string | undefined,
    presentedToken: string,
    context: SessionContext = {},
  ): Promise<AuthResult> {
    if (!sessionId) throw new InvalidRefreshTokenException();

    const [user, session] = await Promise.all([
      this.users.findById(userId),
      this.sessions.findById(sessionId),
    ]);

    if (!user) throw new InvalidRefreshTokenException();
    if (!session || session.userId !== userId) throw new InvalidRefreshTokenException();
    if (session.expiresAt < new Date()) {
      await this.sessions.delete(sessionId);
      throw new InvalidRefreshTokenException();
    }

    const tokenMatches = await this.hashing.compareToken(presentedToken, session.hashedToken);
    if (!tokenMatches) throw new InvalidRefreshTokenException();

    // Rotate: delete old session and issue a new one.
    await this.sessions.delete(sessionId);
    return this.issueSession(user, context);
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    if (sessionId) {
      await this.sessions.delete(sessionId);
    } else {
      await this.sessions.deleteByUserId(userId);
    }
    await this.audit.log(AuditAction.LOGOUT, userId);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessions.deleteByUserId(userId);
    await this.audit.log(AuditAction.LOGOUT, userId);
  }

  async me(userId: string): Promise<UserProfileResponse> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundException();
    return UserMapper.toProfile(user);
  }

  async listSessions(userId: string): Promise<SessionResponse[]> {
    const sessions = await this.sessions.findByUserId(userId);
    return sessions.map(SessionMapper.toResponse);
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.sessions.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new SessionNotFoundException();
    }
    await this.sessions.delete(sessionId);
  }

  async verifyEmail(otp: string): Promise<void> {
    const tokenHash = this.hashing.sha256(otp);
    const user = await this.users.findByEmailVerificationToken(tokenHash);

    if (!user || !user.emailVerificationExpiry || user.emailVerificationExpiry < new Date()) {
      throw new InvalidVerificationTokenException();
    }

    if (user.emailVerified) {
      throw new EmailAlreadyVerifiedException();
    }

    await this.users.markEmailVerified(user.id);
    await this.audit.log(AuditAction.EMAIL_VERIFIED, user.id);

    try {
      await this.mail.sendWelcomeEmail(user.email, user.fullName);
    } catch (err) {
      this.logger.error('Failed to send welcome email', err);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findByEmail(email.toLowerCase());
    // Always return success — do not reveal whether the email is registered.
    if (!user) return;

    const rawToken = this.hashing.generateToken();
    const tokenHash = this.hashing.sha256(rawToken);
    const ttlMs = this.config.getOrThrow<number>('mail.passwordResetTokenTtlMs');
    const expiry = new Date(Date.now() + ttlMs);

    await this.users.setPasswordReset(user.id, tokenHash, expiry);

    const frontendUrl = this.config.getOrThrow<string>('frontendUrl');
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    try {
      await this.mail.sendPasswordResetEmail(user.email, user.fullName, resetUrl);
    } catch (err) {
      this.logger.error('Failed to send password reset email', err);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashing.sha256(token);
    const user = await this.users.findByPasswordResetToken(tokenHash);

    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      throw new InvalidResetTokenException();
    }

    const passwordHash = await this.hashing.hash(newPassword);

    // Rotate password and invalidate all active sessions (force re-login everywhere).
    await Promise.all([
      this.users.clearPasswordReset(user.id, passwordHash),
      this.sessions.deleteByUserId(user.id),
    ]);

    await this.audit.log(AuditAction.PASSWORD_RESET, user.id);
  }

  /**
   * Creates a new Session record and issues a fresh token pair.
   * The session ID is embedded in both JWTs so it can be retrieved on refresh/logout.
   */
  private async issueSession(user: User, context: SessionContext = {}): Promise<AuthResult> {
    const sessionId = randomUUID();
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, sid: sessionId };
    const tokens: TokenPair = await this.tokens.generateTokens(payload);
    const hashedToken = await this.hashing.hashToken(tokens.refreshToken);

    const ttlMs = this.config.getOrThrow<number>('cookies.refreshMaxAgeMs');
    const expiresAt = new Date(Date.now() + ttlMs);

    await this.sessions.create({
      id: sessionId,
      userId: user.id,
      hashedToken,
      expiresAt,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
    });

    return { user: UserMapper.toProfile(user), tokens };
  }

  /**
   * Generates a 4-digit OTP, stores its SHA-256 hash, and emails the raw code.
   * Best-effort — failure is logged but does not block registration.
   */
  private async dispatchVerificationEmail(user: User): Promise<void> {
    const otp = this.hashing.generateOtp();
    const tokenHash = this.hashing.sha256(otp);
    const ttlMs = this.config.getOrThrow<number>('mail.verificationTokenTtlMs');
    const expiry = new Date(Date.now() + ttlMs);

    await this.users.setEmailVerification(user.id, tokenHash, expiry);

    try {
      await this.mail.sendVerificationEmail(user.email, user.fullName, otp);
    } catch (err) {
      this.logger.error('Failed to send verification email', err);
    }
  }
}
