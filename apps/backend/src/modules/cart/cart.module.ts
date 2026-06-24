import { Module } from '@nestjs/common';

import { ProductsModule } from '../products/products.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { CartCookieService } from './services/cart-cookie.service';

@Module({
  // ProductsModule exports ProductRepository (product existence/availability check).
  imports: [ProductsModule],
  controllers: [CartController],
  providers: [CartService, CartRepository, CartCookieService],
  // CartService is exported so its reusable merge logic can be invoked elsewhere.
  exports: [CartService],
})
export class CartModule {}
