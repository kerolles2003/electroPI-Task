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

  /**
   * Creates a user and persists their initial hashed refresh token atomically.
   * `buildRefreshToken` receives the created user (for its id) and returns the
   * hash to store, so registration is all-or-nothing.
   */
  createWithRefreshToken(
    data: Prisma.UserCreateInput,
    buildRefreshToken: (user: User) => Promise<string>,
  ): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({ data });
      const hashedRefreshToken = await buildRefreshToken(created);
      return tx.user.update({
        where: { id: created.id },
        data: { hashedRefreshToken },
      });
    });
  }

  setHashedRefreshToken(id: string, hashedRefreshToken: string | null): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { hashedRefreshToken },
    });
  }
}
