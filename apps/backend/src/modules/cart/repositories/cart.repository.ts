import { Injectable } from '@nestjs/common';
import { CartItem, Prisma } from '@prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';

// Cart with its items and each item's product eagerly loaded.
const CART_INCLUDE = {
  items: {
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

/**
 * Sole data-access point for the Cart aggregate (Cart + CartItem).
 */
@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<CartWithItems | null> {
    return this.prisma.cart.findUnique({ where: { userId }, include: CART_INCLUDE });
  }

  findByGuestToken(guestToken: string): Promise<CartWithItems | null> {
    return this.prisma.cart.findUnique({ where: { guestToken }, include: CART_INCLUDE });
  }

  findById(id: string): Promise<CartWithItems | null> {
    return this.prisma.cart.findUnique({ where: { id }, include: CART_INCLUDE });
  }

  createForUser(userId: string): Promise<CartWithItems> {
    return this.prisma.cart.create({ data: { userId }, include: CART_INCLUDE });
  }

  createForGuest(guestToken: string): Promise<CartWithItems> {
    return this.prisma.cart.create({ data: { guestToken }, include: CART_INCLUDE });
  }

  /** Adds a line, or increments the quantity if the product is already present. */
  upsertItem(cartId: string, productId: string, quantity: number): Promise<CartItem> {
    return this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
  }

  updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async clearItems(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }

  /**
   * Merges a guest cart into a user cart atomically: each guest line is added to
   * the user cart (summing quantities on duplicate products), then the guest
   * cart is deleted (its items cascade away).
   */
  async mergeCarts(userCartId: string, guestCartId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const guestItems = await tx.cartItem.findMany({ where: { cartId: guestCartId } });

      for (const item of guestItems) {
        await tx.cartItem.upsert({
          where: { cartId_productId: { cartId: userCartId, productId: item.productId } },
          create: { cartId: userCartId, productId: item.productId, quantity: item.quantity },
          update: { quantity: { increment: item.quantity } },
        });
      }

      await tx.cart.delete({ where: { id: guestCartId } });
    });
  }
}
