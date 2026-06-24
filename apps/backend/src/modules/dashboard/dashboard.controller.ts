import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { DASHBOARD_TAG } from './constants/dashboard.constant';
import { DashboardOverviewResponse } from './dto/dashboard-overview.response';
import { OrderStatsResponse } from './dto/order-stats.response';
import { RecentOrdersResponse } from './dto/recent-orders.response';
import { TopCustomersResponse } from './dto/top-customers.response';
import { TopProductsResponse } from './dto/top-products.response';
import { DashboardService } from './dashboard.service';

@ApiTags(DASHBOARD_TAG)
@Controller('admin/dashboard')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Requires the ADMIN role' })
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard overview counts and total revenue' })
  @ApiOkResponse({ type: DashboardOverviewResponse })
  getOverview(): Promise<DashboardOverviewResponse> {
    return this.dashboard.getOverview();
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Paginated list of the most recent orders' })
  @ApiOkResponse({ type: RecentOrdersResponse })
  getRecentOrders(@Query() query: PaginationQueryDto): Promise<RecentOrdersResponse> {
    return this.dashboard.getRecentOrders(query);
  }

  @Get('order-stats')
  @ApiOperation({ summary: 'Revenue overview and order distribution by status' })
  @ApiOkResponse({ type: OrderStatsResponse })
  getOrderStats(): Promise<OrderStatsResponse> {
    return this.dashboard.getOrderStats();
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Products ranked by units sold (paginated)' })
  @ApiOkResponse({ type: TopProductsResponse })
  getTopProducts(@Query() query: PaginationQueryDto): Promise<TopProductsResponse> {
    return this.dashboard.getTopProducts(query);
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Customers ranked by order count (paginated)' })
  @ApiOkResponse({ type: TopCustomersResponse })
  getTopCustomers(@Query() query: PaginationQueryDto): Promise<TopCustomersResponse> {
    return this.dashboard.getTopCustomers(query);
  }
}
