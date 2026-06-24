import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { OrderListResponse } from './dto/order-list.response';
import { OrderResponse } from './dto/order.response';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@ApiTags('admin-orders')
@Controller('admin/orders')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@ApiForbiddenResponse({ description: 'Requires the ADMIN role' })
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List all orders (admin, paginated, optional status filter)' })
  @ApiOkResponse({ type: OrderListResponse })
  list(@Query() query: AdminOrderQueryDto): Promise<OrderListResponse> {
    return this.orders.listForAdmin(query);
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Get any order by order number (admin)' })
  @ApiOkResponse({ type: OrderResponse })
  @ApiNotFoundResponse({ description: 'Order not found' })
  getOne(@Param('orderNumber') orderNumber: string): Promise<OrderResponse> {
    return this.orders.getForAdmin(orderNumber);
  }

  @Patch(':orderNumber/status')
  @ApiOperation({ summary: 'Update order status (admin); terminal states are final' })
  @ApiOkResponse({ type: OrderResponse })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiConflictResponse({ description: 'Order is in a terminal state and cannot be changed' })
  updateStatus(
    @Param('orderNumber') orderNumber: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    return this.orders.updateStatus(orderNumber, dto);
  }
}
