import { Module } from '@nestjs/common';

import { CartModule } from '../cart/cart.module';
import { PaymentsModule } from '../payments/payments.module';
import { AdminOrdersController } from './admin-orders.controller';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderRepository } from './repositories/order.repository';

@Module({
  // CartModule exports CartService (read + clear the cart during checkout);
  // PaymentsModule exports PaymentsService (provider abstraction + initiation).
  imports: [CartModule, PaymentsModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, OrderRepository],
})
export class OrdersModule {}
