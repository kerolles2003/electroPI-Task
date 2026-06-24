import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserProfileResponse } from './dto/user-profile.response';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CookieService } from './services/cookie.service';
import { AuthenticatedUser, RefreshTokenUser } from './interfaces/authenticated-user.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: CookieService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiCreatedResponse({ type: UserProfileResponse })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserProfileResponse> {
    const { user, tokens } = await this.auth.register(dto);
    this.cookies.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and set HTTP-only auth cookies' })
  @ApiOkResponse({ type: UserProfileResponse })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserProfileResponse> {
    const { user, tokens } = await this.auth.login(dto);
    this.cookies.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return user;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Rotate tokens using the refresh cookie' })
  @ApiOkResponse({ type: UserProfileResponse })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired refresh token' })
  async refresh(
    @CurrentUser() user: RefreshTokenUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserProfileResponse> {
    const result = await this.auth.refresh(user.id, user.refreshToken);
    this.cookies.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    return result.user;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Invalidate the refresh token and clear cookies' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    await this.auth.logout(user.id);
    this.cookies.clearAuthCookies(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get the current authenticated user profile' })
  @ApiOkResponse({ type: UserProfileResponse })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  @ApiNotFoundResponse({ description: 'Authenticated user no longer exists' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UserProfileResponse> {
    return this.auth.me(user.id);
  }
}
