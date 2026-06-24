import { Injectable } from '@nestjs/common';
import { Payment, PaymentStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Data-access for post-creation Payment state changes. The Payment row itself is
 * created as part of the Order aggregate (see OrderRepository); this repository
 * owns reference attachment and webhook-driven status transitions.
 *
 * Status transitions use conditional `updateMany` so they are atomic and
 * idempotent: the guard lives in the WHERE clause, so a settled payment is never
 * overwritten and concurrent/duplicate deliveries converge to one transition.
 */
@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByTransactionRef(transactionRef: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { transactionRef } });
  }

  /** Resolves a payment via its order's number (Stripe `client_reference_id`). */
  findByOrderNumber(orderNumber: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({ where: { order: { orderNumber } } });
  }

  setTransactionRefByOrder(orderId: string, transactionRef: string): Promise<Payment> {
    return this.prisma.payment.update({ where: { orderId }, data: { transactionRef } });
  }

  /** PENDING/anything-but-PAID → PAID. No-op if already PAID. */
  async markPaid(paymentId: string): Promise<void> {
    await this.prisma.payment.updateMany({
      where: { id: paymentId, status: { not: PaymentStatus.PAID } },
      data: { status: PaymentStatus.PAID, paidAt: new Date() },
    });
  }

  /** PENDING COD payment → PAID on delivery. No-op for non-COD or already-PAID payments. */
  async markCodPaidByOrder(orderId: string): Promise<void> {
    await this.prisma.payment.updateMany({
      where: { orderId, method: 'CASH_ON_DELIVERY', status: { not: PaymentStatus.PAID } },
      data: { status: PaymentStatus.PAID, paidAt: new Date() },
    });
  }

  /** PENDING → FAILED only. Never downgrades a PAID payment. */
  async markFailed(paymentId: string): Promise<void> {
    await this.prisma.payment.updateMany({
      where: { id: paymentId, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.FAILED },
    });
  }

  /** PENDING → FAILED for an order's payment only. Never downgrades a PAID payment. */
  async markFailedByOrder(orderId: string): Promise<void> {
    await this.prisma.payment.updateMany({
      where: { orderId, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.FAILED },
    });
  }
}
