import { Injectable } from '@nestjs/common';
import { Payment, PaymentStatus } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Data-access for post-creation Payment state changes. The Payment row itself is
 * created as part of the Order aggregate (see OrderRepository); this repository
 * owns reference attachment and webhook-driven status transitions.
 */
@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByTransactionRef(transactionRef: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({ where: { transactionRef } });
  }

  setTransactionRefByOrder(orderId: string, transactionRef: string): Promise<Payment> {
    return this.prisma.payment.update({ where: { orderId }, data: { transactionRef } });
  }

  markPaid(paymentId: string): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.PAID, paidAt: new Date() },
    });
  }

  markFailed(paymentId: string): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED },
    });
  }

  markFailedByOrder(orderId: string): Promise<Payment> {
    return this.prisma.payment.update({
      where: { orderId },
      data: { status: PaymentStatus.FAILED },
    });
  }
}
