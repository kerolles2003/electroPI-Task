import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface CreateAuditLogData {
  action: AuditAction;
  userId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuditLogData): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId ?? null,
        ...(data.metadata !== undefined && {
          metadata: data.metadata as Prisma.InputJsonValue,
        }),
      },
    });
  }
}
