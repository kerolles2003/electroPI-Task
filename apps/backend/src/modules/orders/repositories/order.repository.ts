import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

const ORDER_INCLUDE = { items: true, payment: true } satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: { items: true; payment: true };
}>;

export interface PaginatedOrders {
  items: OrderWithRelations[];
  total: number;
}

/**
 * Sole data-access point for the Order aggregate (Order + OrderItem + Payment).
 */
@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.OrderCreateInput): Promise<OrderWithRelations> {
    return this.prisma.order.create({ data, include: ORDER_INCLUDE });
  }

  findByOrderNumber(orderNumber: string): Promise<OrderWithRelations | null> {
    return this.prisma.order.findUnique({ where: { orderNumber }, include: ORDER_INCLUDE });
  }

  updateStatusByOrderNumber(orderNumber: string, status: OrderStatus): Promise<OrderWithRelations> {
    return this.prisma.order.update({
      where: { orderNumber },
      data: { status },
      include: ORDER_INCLUDE,
    });
  }

  async findManyByUser(
    userId: string,
    params: { skip: number; take: number },
  ): Promise<PaginatedOrders> {
    const where: Prisma.OrderWhereInput = { userId };
    return this.paginate(where, params);
  }

  async findManyAdmin(
    params: { skip: number; take: number; status?: OrderStatus },
  ): Promise<PaginatedOrders> {
    const where: Prisma.OrderWhereInput = params.status ? { status: params.status } : {};
    return this.paginate(where, params);
  }

  private async paginate(
    where: Prisma.OrderWhereInput,
    params: { skip: number; take: number },
  ): Promise<PaginatedOrders> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total };
  }
}
