import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentProvider as PaymentProviderName,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { randomBytes } from 'node:crypto';

import { PageMetaResponse } from '../../common/dto/page-meta.response';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CartService } from '../cart/cart.service';
import { CartResponse } from '../cart/dto/cart.response';
import { PaymentsService } from '../payments/payments.service';
import {
  ADMIN_UPDATABLE_STATUSES,
  DEFAULT_DELIVERY_FEE,
  DEFAULT_ORDER_CURRENCY,
  ORDER_NUMBER_MAX_ATTEMPTS,
  ORDER_NUMBER_PREFIX,
  TERMINAL_ORDER_STATUSES,
} from './constants/order.constant';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutResponse } from './dto/checkout.response';
import { OrderListResponse } from './dto/order-list.response';
import { OrderResponse } from './dto/order.response';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddressNotFoundException } from './exceptions/address-not-found.exception';
import { CartEmptyException } from './exceptions/cart-empty.exception';
import { CheckoutProductUnavailableException } from './exceptions/checkout-product-unavailable.exception';
import { OrderNotFoundException } from './exceptions/order-not-found.exception';
import { OrderStatusTransitionException } from './exceptions/order-status-transition.exception';
import { OrderMapper } from './mappers/order.mapper';
import { OrderRepository, OrderWithRelations } from './repositories/order.repository';
import { AddressRepository } from './repositories/address.repository';

const PRISMA_UNIQUE_VIOLATION = 'P2002';

/** Rounds to 2 decimal places, guarding against binary float drift. */
function toMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly orders: OrderRepository,
    private readonly addresses: AddressRepository,
    private readonly cart: CartService,
    private readonly payments: PaymentsService,
  ) {}

  async checkout(user: AuthenticatedUser, dto: CheckoutDto): Promise<CheckoutResponse> {
    // Address must exist and belong to the current user.
    const address = await this.addresses.findById(dto.addressId);
    if (!address || address.userId !== user.id) {
      throw new AddressNotFoundException();
    }

    // Cart must not be empty and all products must still be available.
    const cart = await this.cart.getCart({ userId: user.id });
    if (cart.items.length === 0) {
      throw new CartEmptyException();
    }
    if (cart.items.some((item) => !item.product.isAvailable)) {
      throw new CheckoutProductUnavailableException();
    }

    const subtotal = toMoney(cart.subtotal);
    const deliveryFee = DEFAULT_DELIVERY_FEE;
    const total = toMoney(subtotal + deliveryFee);
    const currency = DEFAULT_ORDER_CURRENCY;
    const method = dto.paymentMethod;
    const provider = this.payments.providerNameFor(method);

    // Create the order, its item snapshots, and the (PENDING) payment atomically.
    const order = await this.createOrderRecord({
      userId: user.id,
      addressId: address.id,
      notes: dto.notes,
      cart,
      subtotal,
      deliveryFee,
      total,
      currency,
      method,
      provider,
    });

    // Initiate payment with the provider (Stripe creates a checkout session;
    // COD is a no-op). Persist the transaction reference when one is returned.
    let checkoutUrl: string | null = null;
    try {
      const initiation = await this.payments.initiate(method, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: total,
        currency,
        customerEmail: user.email,
      });
      checkoutUrl = initiation.checkoutUrl;
      if (initiation.transactionRef) {
        await this.payments.attachTransactionRef(order.id, initiation.transactionRef);
      }
    } catch {
      // A payment-provider failure must NOT delete the order. The order stays
      // PENDING while the payment is recorded as FAILED — the two lifecycles are
      // independent, so the order remains visible and the failure is explicit.
      await this.payments.markFailedByOrder(order.id);
    }

    // Clear the cart only after the order has been created successfully.
    await this.cart.clearCart({ userId: user.id });

    const persisted = (await this.orders.findByOrderNumber(order.orderNumber)) ?? order;
    return { order: OrderMapper.toResponse(persisted), checkoutUrl };
  }

  async listForUser(user: AuthenticatedUser, query: PaginationQueryDto): Promise<OrderListResponse> {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await this.orders.findManyByUser(user.id, { skip, take: query.limit });
    return this.toListResponse(items, query.page, query.limit, total);
  }

  async getForUser(user: AuthenticatedUser, orderNumber: string): Promise<OrderResponse> {
    const order = await this.orders.findByOrderNumber(orderNumber);
    // Ownership: a non-owned (or missing) order is reported as not found.
    if (!order || order.userId !== user.id) {
      throw new OrderNotFoundException();
    }
    return OrderMapper.toResponse(order);
  }

  async listForAdmin(query: AdminOrderQueryDto): Promise<OrderListResponse> {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await this.orders.findManyAdmin({
      skip,
      take: query.limit,
      status: query.status,
    });
    return this.toListResponse(items, query.page, query.limit, total);
  }

  async getForAdmin(orderNumber: string): Promise<OrderResponse> {
    const order = await this.orders.findByOrderNumber(orderNumber);
    if (!order) {
      throw new OrderNotFoundException();
    }
    return OrderMapper.toResponse(order);
  }

  async updateStatus(orderNumber: string, dto: UpdateOrderStatusDto): Promise<OrderResponse> {
    const order = await this.orders.findByOrderNumber(orderNumber);
    if (!order) {
      throw new OrderNotFoundException();
    }
    // Forbidden transitions: DELIVERED/CANCELLED are terminal.
    if (TERMINAL_ORDER_STATUSES.includes(order.status)) {
      throw new OrderStatusTransitionException();
    }
    // Target is constrained to admin-updatable statuses by the DTO; re-checked defensively.
    if (!ADMIN_UPDATABLE_STATUSES.includes(dto.status)) {
      throw new OrderStatusTransitionException();
    }

    const updated = await this.orders.updateStatusByOrderNumber(orderNumber, dto.status);
    return OrderMapper.toResponse(updated);
  }

  private async createOrderRecord(params: {
    userId: string;
    addressId: string;
    notes?: string;
    cart: CartResponse;
    subtotal: number;
    deliveryFee: number;
    total: number;
    currency: string;
    method: PaymentMethod;
    provider: PaymentProviderName;
  }): Promise<OrderWithRelations> {
    const itemsCreate: Prisma.OrderItemCreateWithoutOrderInput[] = params.cart.items.map((item) => ({
      product: { connect: { id: item.productId } },
      productNameEn: item.product.nameEn,
      productNameAr: item.product.nameAr,
      unitPrice: new Prisma.Decimal(item.unitPrice),
      quantity: item.quantity,
      lineTotal: new Prisma.Decimal(item.lineTotal),
    }));

    for (let attempt = 0; attempt < ORDER_NUMBER_MAX_ATTEMPTS; attempt += 1) {
      const orderNumber = this.generateOrderNumber();
      try {
        return await this.orders.create({
          orderNumber,
          user: { connect: { id: params.userId } },
          address: { connect: { id: params.addressId } },
          status: OrderStatus.PENDING,
          subtotalAmount: new Prisma.Decimal(params.subtotal),
          deliveryFee: new Prisma.Decimal(params.deliveryFee),
          totalAmount: new Prisma.Decimal(params.total),
          currency: params.currency,
          notes: params.notes,
          items: { create: itemsCreate },
          payment: {
            create: {
              method: params.method,
              provider: params.provider,
              status: PaymentStatus.PENDING,
              amount: new Prisma.Decimal(params.total),
              currency: params.currency,
            },
          },
        });
      } catch (error) {
        const isCollision =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === PRISMA_UNIQUE_VIOLATION;
        if (isCollision && attempt < ORDER_NUMBER_MAX_ATTEMPTS - 1) {
          continue; // Order-number clash — regenerate and retry.
        }
        throw error;
      }
    }

    throw new InternalServerErrorException('Could not generate a unique order number');
  }

  private generateOrderNumber(): string {
    const timePart = Date.now().toString(36).toUpperCase();
    const randomPart = randomBytes(2).toString('hex').toUpperCase();
    return `${ORDER_NUMBER_PREFIX}-${timePart}-${randomPart}`;
  }

  private toListResponse(
    items: OrderWithRelations[],
    page: number,
    limit: number,
    total: number,
  ): OrderListResponse {
    return {
      items: items.map((order) => OrderMapper.toResponse(order)),
      meta: new PageMetaResponse({ page, limit, total }),
    };
  }
}
