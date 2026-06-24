import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiErrorResponse } from '../../common/dto/api-error.response';
import { AuthService } from './auth.service';
import { EmailVerificationResponse } from './dto/email-verification.response';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetResponse } from './dto/password-reset.response';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponse } from './dto/register.response';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SessionResponse } from './dto/session.response';
import { UserProfileResponse } from './dto/user-profile.response';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthenticatedUser, RefreshTokenUser } from './interfaces/authenticated-user.interface';
import { CookieService } from './services/cookie.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: CookieService,
  ) {}

  // ── Registration ────────────────────────────────────────────────────────────

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Register a new customer account',
    description:
      'Creates an account, opens a session (sets HTTP-only auth cookies), and dispatches a **4-digit OTP** to the provided email for verification.\n\n**Rate limit:** 3 requests / minute.',
  })
  @ApiCreatedResponse({ type: RegisterResponse, description: 'Account created. Auth cookies set.' })
  @ApiBadRequestResponse({ type: ApiErrorResponse, description: 'Validation error' })
  @ApiConflictResponse({ type: ApiErrorResponse, description: 'Email already registered' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded — 3 requests/minute' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RegisterResponse> {
    const result = await this.auth.register(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    this.cookies.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return {
      message: 'Account created successfully. Please check your email for the 4-digit verification code.',
      user: result.user,
    };
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Log in to an existing account',
    description:
      'Authenticates the user and sets HTTP-only `access_token` (7 days) and `refresh_token` (7 days) cookies.\n\n**Rate limit:** 5 requests / minute.',
  })
  @ApiOkResponse({ type: UserProfileResponse, description: 'Authenticated. Auth cookies set.' })
  @ApiBadRequestResponse({ type: ApiErrorResponse, description: 'Validation error' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponse, description: 'Invalid email or password' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded — 5 requests/minute' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserProfileResponse> {
    const result = await this.auth.login(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    this.cookies.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return result.user;
  }

  // ── Token rotation ───────────────────────────────────────────────────────────

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Rotate the access and refresh tokens',
    description:
      'Requires a valid `refresh_token` cookie. The current session is deleted and a new one is issued with a fresh token pair. Call this when the `access_token` has expired.',
  })
  @ApiOkResponse({ type: UserProfileResponse, description: 'New tokens issued. Cookies updated.' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponse, description: 'Missing, invalid, or expired refresh token' })
  async refresh(
    @CurrentUser() user: RefreshTokenUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserProfileResponse> {
    const result = await this.auth.refresh(user.id, user.sessionId, user.refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    this.cookies.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return result.user;
  }

  // ── Logout (current session) ─────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Log out of the current session',
    description:
      'Deletes the current session record and clears the auth cookies on the response. Other active sessions (other devices) are unaffected.',
  })
  @ApiOkResponse({
    schema: { properties: { success: { type: 'boolean', example: true } } },
    description: 'Session revoked and cookies cleared',
  })
  @ApiUnauthorizedResponse({ type: ApiErrorResponse, description: 'Missing or invalid access token' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    await this.auth.logout(user.id, user.sessionId);
    this.cookies.clearAuthCookies(res);
    return { success: true };
  }

  // ── Current user ─────────────────────────────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Get the current user profile',
    description: 'Returns the authenticated user\'s profile. Reads from the database on every call.',
  })
  @ApiOkResponse({ type: UserProfileResponse })
  @ApiUnauthorizedResponse({ type: ApiErrorResponse, description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ type: ApiErrorResponse, description: 'Authenticated user no longer exists in the database' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserProfileResponse> {
    return this.auth.me(user.id);
  }

  // ── Email verification ────────────────────────────────────────────────────────

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Verify email address with the 4-digit OTP',
    description:
      'Validates the 4-digit OTP sent after registration. On success the account is marked as verified and a welcome email is sent. The OTP is single-use and expires after **24 hours**.\n\n**Rate limit:** 5 requests / minute.',
  })
  @ApiOkResponse({ type: EmailVerificationResponse, description: 'Email verified. Welcome email sent.' })
  @ApiBadRequestResponse({ type: ApiErrorResponse, description: 'OTP is missing, invalid, or expired' })
  @ApiConflictResponse({ type: ApiErrorResponse, description: 'Email address is already verified' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded — 5 requests/minute' })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<EmailVerificationResponse> {
    await this.auth.verifyEmail(dto.otp);
    return { message: 'Email verified successfully' };
  }

  // ── Password reset ────────────────────────────────────────────────────────────

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Request a password reset email',
    description:
      'Sends a password reset link to the given email address if an account with that address exists. **Always returns 200** — the response intentionally does not reveal whether the email is registered.\n\n**Rate limit:** 3 requests / minute.',
  })
  @ApiOkResponse({ type: PasswordResetResponse, description: 'Request accepted' })
  @ApiBadRequestResponse({ type: ApiErrorResponse, description: 'Validation error' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded — 3 requests/minute' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<PasswordResetResponse> {
    await this.auth.forgotPassword(dto.email);
    return { message: 'If that email is registered, a reset link has been sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Reset password using the emailed link',
    description:
      'Validates the reset token, updates the password, and **revokes all active sessions** across every device — the user must log in again everywhere. The token is single-use and expires after **1 hour**.\n\n**Rate limit:** 5 requests / minute.',
  })
  @ApiOkResponse({ type: PasswordResetResponse, description: 'Password updated. All sessions revoked.' })
  @ApiBadRequestResponse({ type: ApiErrorResponse, description: 'Token is invalid or expired, or the new password fails validation' })
  @ApiTooManyRequestsResponse({ description: 'Rate limit exceeded — 5 requests/minute' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<PasswordResetResponse> {
    await this.auth.resetPassword(dto.token, dto.password);
    return { message: 'Password reset successfully. Please log in with your new password.' };
  }

  // ── Session management ────────────────────────────────────────────────────────

  @Get('sessions')
  @UseGuards(JwtAccessGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'List active sessions',
    description:
      'Returns all active sessions for the current user (up to 50), each with device info (`userAgent`, `ipAddress`) and expiry. The current session is included in the list.',
  })
  @ApiOkResponse({ type: [SessionResponse] })
  @ApiUnauthorizedResponse({ type: ApiErrorResponse, description: 'Missing or invalid access token' })
  listSessions(@CurrentUser() user: AuthenticatedUser): Promise<SessionResponse[]> {
    return this.auth.listSessions(user.id);
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Log out from all devices',
    description:
      'Revokes every session for the current user and clears the auth cookies. Use this as a security measure if you suspect account compromise.',
  })
  @ApiOkResponse({
    schema: { properties: { success: { type: 'boolean', example: true } } },
    description: 'All sessions revoked and cookies cleared',
  })
  @ApiUnauthorizedResponse({ type: ApiErrorResponse, description: 'Missing or invalid access token' })
  async logoutAll(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    await this.auth.logoutAll(user.id);
    this.cookies.clearAuthCookies(res);
    return { success: true };
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Revoke a specific session',
    description:
      'Deletes a single session by its ID. Useful for logging out from a specific device without affecting other active sessions. Returns 404 if the session does not exist or belongs to a different user.',
  })
  @ApiOkResponse({
    schema: { properties: { success: { type: 'boolean', example: true } } },
    description: 'Session revoked',
  })
  @ApiUnauthorizedResponse({ type: ApiErrorResponse, description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ type: ApiErrorResponse, description: 'Session not found or belongs to a different user' })
  async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
  ): Promise<{ success: boolean }> {
    await this.auth.revokeSession(user.id, sessionId);
    return { success: true };
  }
}
