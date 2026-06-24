import { Injectable } from '@nestjs/common';
import { Session } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface CreateSessionData {
  id: string;
  userId: string;
  hashedToken: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSessionData): Promise<Session> {
    return this.prisma.session.create({
      data: {
        id: data.id,
        userId: data.userId,
        hashedToken: data.hashedToken,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent ?? null,
        ipAddress: data.ipAddress ?? null,
      },
    });
  }

  findById(id: string): Promise<Session | null> {
    return this.prisma.session.findUnique({ where: { id } });
  }

  findByUserId(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // defensive upper-bound; real cap enforced via session limit in issueSession
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { id } });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }
}
