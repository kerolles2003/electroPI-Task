import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

export interface OverviewData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface RecentOrderRow {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus | null;
  createdAt: Date;
}

export interface OrderStatsData {
  revenue: { total: number; paid: number; cod: number };
  distribution: Record<OrderStatus, number>;
}

export interface TopProductRow {
  productId: string;
  productName: string;
  quantitySold: number;
}

export interface TopCustomerRow {
  userId: string;
  customerName: string;
  ordersCount: number;
}

export interface PaginatedDashboardResult<T> {
  items: T[];
  total: number;
}

/**
 * Read-only analytics queries for the admin dashboard. No business logic;
 * only aggregation, grouping, and projection.
 *
 * RAW SQL NOTE: $queryRaw calls reference PostgreSQL table names that Prisma
 * derives from the model name by default (e.g. model "Order" → table "Order",
 * model "OrderItem" → table "OrderItem"). If a model ever gains an @@map(...)
 * directive, the raw SQL must be updated to match the mapped name.
 */
@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  // M-2: Promise.all instead of $transaction — these reads are independent and
  // need no snapshot consistency; parallel execution on separate pool connections
  // reduces wall-clock latency compared to a serialised interactive transaction.
  async getOverview(): Promise<OverviewData> {
    const [userCount, orderCount, revenueAgg, pendingCount, deliveredCount] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.order.count(),
        this.prisma.payment.aggregate({
          where: { status: PaymentStatus.PAID },
          _sum: { amount: true },
        }),
        this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      ]);

    return {
      totalUsers: userCount,
      totalOrders: orderCount,
      totalRevenue: Number(revenueAgg._sum.amount ?? 0),
      pendingOrders: pendingCount,
      completedOrders: deliveredCount,
    };
  }

  // M-2: Promise.all — findMany + count are independent reads.
  async getRecentOrders(
    skip: number,
    take: number,
  ): Promise<PaginatedDashboardResult<RecentOrderRow>> {
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        select: {
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          user: { select: { fullName: true } },
          payment: { select: { status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count(),
    ]);

    return {
      items: orders.map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.user.fullName,
        totalAmount: Number(o.totalAmount),
        orderStatus: o.status,
        paymentStatus: o.payment?.status ?? null,
        createdAt: o.createdAt,
      })),
      total,
    };
  }

  async getOrderStats(): Promise<OrderStatsData> {
    // M-1: `total` is gross order value (sum of non-cancelled Order.totalAmount),
    // not a sum of raw Payment.amount which would include FAILED and REFUNDED rows.
    // `paid` and `cod` correctly scope to PaymentStatus.PAID.
    // M-A: all four reads are independent; Promise.all runs them concurrently on
    // separate pool connections — no snapshot consistency is needed here.
    const [totalRevAgg, paidRevAgg, codRevAgg, statusGroups] = await Promise.all([
      this.prisma.order.aggregate({
        where: { status: { not: OrderStatus.CANCELLED } },
        _sum: { totalAmount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { method: PaymentMethod.CASH_ON_DELIVERY, status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const byStatus = new Map(statusGroups.map((g) => [g.status, g._count._all]));

    return {
      revenue: {
        total: Number(totalRevAgg._sum.totalAmount ?? 0),
        paid: Number(paidRevAgg._sum.amount ?? 0),
        cod: Number(codRevAgg._sum.amount ?? 0),
      },
      distribution: {
        [OrderStatus.PENDING]: byStatus.get(OrderStatus.PENDING) ?? 0,
        [OrderStatus.CONFIRMED]: byStatus.get(OrderStatus.CONFIRMED) ?? 0,
        [OrderStatus.PREPARING]: byStatus.get(OrderStatus.PREPARING) ?? 0,
        [OrderStatus.OUT_FOR_DELIVERY]: byStatus.get(OrderStatus.OUT_FOR_DELIVERY) ?? 0,
        [OrderStatus.DELIVERED]: byStatus.get(OrderStatus.DELIVERED) ?? 0,
        [OrderStatus.CANCELLED]: byStatus.get(OrderStatus.CANCELLED) ?? 0,
      },
    };
  }

  async getTopProducts(
    skip: number,
    take: number,
  ): Promise<PaginatedDashboardResult<TopProductRow>> {
    // C-3: Prisma groupBy cannot filter through a relation, so we use raw SQL to
    // join OrderItem → Order and exclude CANCELLED orders. Without this join,
    // items from cancelled orders inflate quantitySold.
    //
    // RAW SQL NOTE: table names "OrderItem" and "Order" must match the Prisma
    // model names (or @@map values if ever added). Column names match the Prisma
    // field names (camelCase) as Prisma uses the field name as the column name by
    // default. The status cast (::text) avoids a type mismatch with the parameterised
    // OrderStatus enum value.
    const cancelledStatus = OrderStatus.CANCELLED;

    const [productRows, countRows] = await Promise.all([
      this.prisma.$queryRaw<Array<{ productId: string; productName: string; quantitySold: bigint }>>(
        Prisma.sql`
          SELECT
            oi."productId",
            MAX(oi."productNameEn") AS "productName",
            SUM(oi.quantity)        AS "quantitySold"
          FROM "OrderItem" oi
          INNER JOIN "Order" o ON o.id = oi."orderId"
          WHERE oi."productId" IS NOT NULL
            AND o.status::text != ${cancelledStatus}
          GROUP BY oi."productId"
          ORDER BY "quantitySold" DESC
          LIMIT ${take} OFFSET ${skip}
        `,
      ),
      this.prisma.$queryRaw<Array<{ count: bigint }>>(
        Prisma.sql`
          SELECT COUNT(DISTINCT oi."productId") AS count
          FROM "OrderItem" oi
          INNER JOIN "Order" o ON o.id = oi."orderId"
          WHERE oi."productId" IS NOT NULL
            AND o.status::text != ${cancelledStatus}
        `,
      ),
    ]);

    const total = Number(countRows[0]?.count ?? 0);

    return {
      items: productRows.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        quantitySold: Number(r.quantitySold),
      })),
      total,
    };
  }

  async getTopCustomers(
    skip: number,
    take: number,
  ): Promise<PaginatedDashboardResult<TopCustomerRow>> {
    // M-C: exclude cancelled orders so the ranking matches getTopProducts.
    // Both groupBy and the raw count apply the same filter so pagination totals
    // remain consistent with the page data.
    // RAW SQL NOTE: table name "Order" must match the Prisma model name (or @@map).
    // The ::text cast matches the parameterised OrderStatus value to the PG enum column.
    const cancelledStatus = OrderStatus.CANCELLED;

    const [groups, countRows] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['userId'],
        where: { status: { not: OrderStatus.CANCELLED } },
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        skip,
        take,
      }),
      this.prisma.$queryRaw<Array<{ count: bigint }>>(
        Prisma.sql`SELECT COUNT(DISTINCT "userId") AS count FROM "Order" WHERE status::text != ${cancelledStatus}`,
      ),
    ]);

    const total = Number(countRows[0]?.count ?? 0);

    if (groups.length === 0) {
      return { items: [], total };
    }

    const userIds = groups.map((g) => g.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true },
    });
    const nameMap = new Map(users.map((u) => [u.id, u.fullName]));

    return {
      items: groups.map((g) => ({
        userId: g.userId,
        customerName: nameMap.get(g.userId) ?? 'Unknown Customer',
        ordersCount: g._count.userId,
      })),
      total,
    };
  }
}
