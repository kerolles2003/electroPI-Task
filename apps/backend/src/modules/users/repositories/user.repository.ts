import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Sole data-access point for the User table. Owned by the users module and
 * exported so other modules (e.g. auth) consume users without re-querying Prisma.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  // ---------- Email verification ----------

  findByEmailVerificationToken(tokenHash: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { emailVerificationToken: tokenHash } });
  }

  async setEmailVerification(userId: string, tokenHash: string, expiry: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken: tokenHash, emailVerificationExpiry: expiry },
    });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });
  }

  // ---------- Password reset ----------

  findByPasswordResetToken(tokenHash: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { passwordResetToken: tokenHash } });
  }

  async setPasswordReset(userId: string, tokenHash: string, expiry: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordResetToken: tokenHash, passwordResetExpiry: expiry },
    });
  }

  async clearPasswordReset(userId: string, newPasswordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });
  }
}
