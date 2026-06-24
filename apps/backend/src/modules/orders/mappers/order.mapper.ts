import { OrderItem, Payment } from '@prisma/client';

import { OrderItemResponse } from '../dto/order-item.response';
import { OrderResponse } from '../dto/order.response';
import { PaymentResponse } from '../dto/payment.response';
import { OrderWithRelations } from '../repositories/order.repository';

/**
 * Maps the persisted Order aggregate to its public representation. Prisma
 * Decimals are normalized to JS numbers.
 */
export class OrderMapper {
  static toResponse(order: OrderWithRelations): OrderResponse {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotalAmount: Number(order.subtotalAmount),
      deliveryFee: Number(order.deliveryFee),
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      notes: order.notes,
      addressId: order.addressId,
      items: order.items.map((item) => this.toItem(item)),
      payment: order.payment ? this.toPayment(order.payment) : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private static toItem(item: OrderItem): OrderItemResponse {
    return {
      id: item.id,
      productId: item.productId,
      productNameEn: item.productNameEn,
      productNameAr: item.productNameAr,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
    };
  }

  private static toPayment(payment: Payment): PaymentResponse {
    return {
      id: payment.id,
      method: payment.method,
      provider: payment.provider,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      transactionRef: payment.transactionRef,
      paidAt: payment.paidAt,
    };
  }
}
