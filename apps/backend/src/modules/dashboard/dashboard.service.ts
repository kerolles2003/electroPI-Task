import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

import { PageMetaResponse } from '../../common/dto/page-meta.response';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { DashboardOverviewResponse } from './dto/dashboard-overview.response';
import {
  OrderDistributionResponse,
  OrderStatsResponse,
  RevenueOverviewResponse,
} from './dto/order-stats.response';
import { RecentOrdersResponse } from './dto/recent-orders.response';
import { TopCustomersResponse } from './dto/top-customers.response';
import { TopProductsResponse } from './dto/top-products.response';
import { DashboardRepository, OrderStatsData } from './repositories/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly repository: DashboardRepository) {}

  getOverview(): Promise<DashboardOverviewResponse> {
    return this.repository.getOverview();
  }

  async getRecentOrders(query: PaginationQueryDto): Promise<RecentOrdersResponse> {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await this.repository.getRecentOrders(skip, query.limit);
    return {
      items,
      meta: new PageMetaResponse({ page: query.page, limit: query.limit, total }),
    };
  }

  async getOrderStats(): Promise<OrderStatsResponse> {
    const data = await this.repository.getOrderStats();
    return {
      revenue: this.mapRevenue(data),
      distribution: this.mapDistribution(data),
    };
  }

  async getTopProducts(query: PaginationQueryDto): Promise<TopProductsResponse> {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await this.repository.getTopProducts(skip, query.limit);
    return {
      items,
      meta: new PageMetaResponse({ page: query.page, limit: query.limit, total }),
    };
  }

  async getTopCustomers(query: PaginationQueryDto): Promise<TopCustomersResponse> {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await this.repository.getTopCustomers(skip, query.limit);
    return {
      items,
      meta: new PageMetaResponse({ page: query.page, limit: query.limit, total }),
    };
  }

  private mapRevenue(data: OrderStatsData): RevenueOverviewResponse {
    return { total: data.revenue.total, paid: data.revenue.paid, cod: data.revenue.cod };
  }

  private mapDistribution(data: OrderStatsData): OrderDistributionResponse {
    const d = data.distribution;
    return {
      pending: d[OrderStatus.PENDING],
      confirmed: d[OrderStatus.CONFIRMED],
      preparing: d[OrderStatus.PREPARING],
      outForDelivery: d[OrderStatus.OUT_FOR_DELIVERY],
      delivered: d[OrderStatus.DELIVERED],
      cancelled: d[OrderStatus.CANCELLED],
    };
  }
}
