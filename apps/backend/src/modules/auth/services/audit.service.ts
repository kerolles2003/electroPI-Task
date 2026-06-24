import { Injectable, Logger } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

import { AuditRepository } from '../repositories/audit.repository';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly auditRepo: AuditRepository) {}

  async log(
    action: AuditAction,
    userId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.auditRepo.create({ action, userId, metadata });
    } catch (err) {
      // Audit failures must never propagate into the auth flow.
      this.logger.error(`Failed to write audit log [${action}]`, err);
    }
  }
}
