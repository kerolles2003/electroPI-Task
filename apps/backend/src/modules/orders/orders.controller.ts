import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutResponse } from './dto/checkout.response';
import { OrderListResponse } from './dto/order-list.response';
import { OrderResponse } from './dto/order.response';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAccessGuard)
@ApiCookieAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Create an order from the current cart' })
  @ApiCreatedResponse({ type: CheckoutResponse })
  @ApiBadRequestResponse({ description: 'Validation failed or cart is empty' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  @ApiConflictResponse({ description: 'A cart product is no longer available' })
  checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CheckoutDto,
  ): Promise<CheckoutResponse> {
    return this.orders.checkout(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List the current user\'s orders (paginated)' })
  @ApiOkResponse({ type: OrderListResponse })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<OrderListResponse> {
    return this.orders.listForUser(user, query);
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Get one of the current user\'s orders by order number' })
  @ApiOkResponse({ type: OrderResponse })
  @ApiNotFoundResponse({ description: 'Order not found' })
  getOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderNumber') orderNumber: string,
  ): Promise<OrderResponse> {
    return this.orders.getForUser(user, orderNumber);
  }
}
