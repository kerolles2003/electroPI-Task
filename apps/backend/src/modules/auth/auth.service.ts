import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { UserRepository } from '../users/repositories/user.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserProfileResponse } from './dto/user-profile.response';
import { EmailAlreadyRegisteredException } from './exceptions/email-already-registered.exception';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception';
import { InvalidRefreshTokenException } from './exceptions/invalid-refresh-token.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UserMapper } from './mappers/user.mapper';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { AuthResult } from './interfaces/auth-result.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokenPair } from './types/token-pair.type';

// Prisma unique-constraint violation (e.g. duplicate email).
const PRISMA_UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hashing: HashingService,
    private readonly tokens: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase();

    // Fast-path check; the unique constraint below is the actual guarantee.
    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyRegisteredException();
    }

    const passwordHash = await this.hashing.hash(dto.password);

    let tokens: TokenPair | undefined;
    try {
      // Create the user and store their initial refresh token atomically.
      const user = await this.users.createWithRefreshToken(
        {
          email,
          passwordHash,
          fullName: dto.name,
          preferredLocale: dto.preferredLocale,
        },
        async (created) => {
          const payload: JwtPayload = {
            sub: created.id,
            email: created.email,
            role: created.role,
          };
          tokens = await this.tokens.generateTokens(payload);
          return this.hashing.hashToken(tokens.refreshToken);
        },
      );

      return { user: UserMapper.toProfile(user), tokens: tokens as TokenPair };
    } catch (error) {
      // Concurrent registration with the same email loses the unique-constraint
      // race here; surface it as the same domain error as the fast-path check.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_UNIQUE_VIOLATION
      ) {
        throw new EmailAlreadyRegisteredException();
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.users.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordMatches = await this.hashing.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsException();
    }

    return this.issueSession(user);
  }

  async refresh(userId: string, presentedRefreshToken: string): Promise<AuthResult> {
    const user = await this.users.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new InvalidRefreshTokenException();
    }

    const tokenMatches = await this.hashing.compareToken(
      presentedRefreshToken,
      user.hashedRefreshToken,
    );
    if (!tokenMatches) {
      throw new InvalidRefreshTokenException();
    }

    return this.issueSession(user);
  }

  async logout(userId: string): Promise<void> {
    await this.users.setHashedRefreshToken(userId, null);
  }

  async me(userId: string): Promise<UserProfileResponse> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    return UserMapper.toProfile(user);
  }

  /**
   * Issues a fresh token pair and rotates the stored (hashed) refresh token.
   */
  private async issueSession(user: User): Promise<AuthResult> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const tokens = await this.tokens.generateTokens(payload);

    const hashedRefreshToken = await this.hashing.hashToken(tokens.refreshToken);
    await this.users.setHashedRefreshToken(user.id, hashedRefreshToken);

    return { user: UserMapper.toProfile(user), tokens };
  }
}
