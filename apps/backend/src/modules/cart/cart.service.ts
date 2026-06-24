import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ProductRepository } from '../products/repositories/product.repository';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartResponse } from './dto/cart.response';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartItemNotFoundException } from './exceptions/cart-item-not-found.exception';
import { CartProductNotFoundException } from './exceptions/cart-product-not-found.exception';
import { CartProductUnavailableException } from './exceptions/cart-product-unavailable.exception';
import { CartIdentity } from './interfaces/cart-identity.interface';
import { CartMapper } from './mappers/cart.mapper';
import { CartRepository, CartWithItems } from './repositories/cart.repository';

// Prisma unique-constraint violation (concurrent cart creation).
const PRISMA_UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class CartService {
  constructor(
    private readonly carts: CartRepository,
    private readonly products: ProductRepository,
  ) {}

  async getCart(identity: CartIdentity): Promise<CartResponse> {
    const cart = await this.findCart(identity);
    return cart ? CartMapper.toResponse(cart) : CartMapper.empty();
  }

  async addItem(identity: CartIdentity, dto: AddCartItemDto): Promise<CartResponse> {
    const product = await this.products.findById(dto.productId);
    if (!product) {
      throw new CartProductNotFoundException();
    }
    if (!product.isAvailable) {
      throw new CartProductUnavailableException();
    }

    const cart = await this.getOrCreateCart(identity);
    await this.carts.upsertItem(cart.id, dto.productId, dto.quantity);

    return this.buildResponse(cart.id);
  }

  async updateItem(
    identity: CartIdentity,
    itemId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponse> {
    const cart = await this.requireCartWithItem(identity, itemId);
    await this.carts.updateItemQuantity(itemId, dto.quantity);

    return this.buildResponse(cart.id);
  }

  async removeItem(identity: CartIdentity, itemId: string): Promise<CartResponse> {
    const cart = await this.requireCartWithItem(identity, itemId);
    await this.carts.deleteItem(itemId);

    return this.buildResponse(cart.id);
  }

  async clearCart(identity: CartIdentity): Promise<CartResponse> {
    const cart = await this.findCart(identity);
    if (cart) {
      await this.carts.clearItems(cart.id);
    }

    return CartMapper.empty();
  }

  /**
   * Reusable, isolated merge of an anonymous guest cart into a user's cart.
   *
   * Guarantees:
   * - Duplicate products are merged by SUMMING their quantities (a guest line for
   *   product X adds to the user's existing line for X rather than replacing it).
   * - The guest cart is DELETED after a successful merge; its items cascade away
   *   (the merge itself runs in a single transaction — see CartRepository.mergeCarts).
   * - The operation is IDEMPOTENT: once the guest cart is gone, subsequent calls
   *   with the same token find no guest cart and return without side effects, so
   *   it is safe to invoke on every authenticated cart request.
   */
  async mergeGuestCartIntoUser(userId: string, guestToken: string): Promise<void> {
    const guestCart = await this.carts.findByGuestToken(guestToken);
    if (!guestCart) {
      return;
    }

    const userCart = await this.getOrCreateUserCart(userId);
    if (userCart.id === guestCart.id) {
      return;
    }

    await this.carts.mergeCarts(userCart.id, guestCart.id);
  }

  private async requireCartWithItem(identity: CartIdentity, itemId: string): Promise<CartWithItems> {
    const cart = await this.findCart(identity);
    // Ownership: the item must live in the caller's own cart.
    if (!cart || !cart.items.some((item) => item.id === itemId)) {
      throw new CartItemNotFoundException();
    }

    return cart;
  }

  private findCart(identity: CartIdentity): Promise<CartWithItems | null> {
    if (identity.userId) {
      return this.carts.findByUserId(identity.userId);
    }
    if (identity.guestToken) {
      return this.carts.findByGuestToken(identity.guestToken);
    }
    return Promise.resolve(null);
  }

  private getOrCreateCart(identity: CartIdentity): Promise<CartWithItems> {
    if (identity.userId) {
      return this.getOrCreateUserCart(identity.userId);
    }
    if (identity.guestToken) {
      return this.getOrCreateGuestCart(identity.guestToken);
    }
    // The controller always resolves an identity before reaching the service.
    throw new InternalServerErrorException('Cart identity could not be resolved');
  }

  private async getOrCreateUserCart(userId: string): Promise<CartWithItems> {
    const existing = await this.carts.findByUserId(userId);
    if (existing) {
      return existing;
    }

    try {
      return await this.carts.createForUser(userId);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        const cart = await this.carts.findByUserId(userId);
        if (cart) {
          return cart;
        }
      }
      throw error;
    }
  }

  private async getOrCreateGuestCart(guestToken: string): Promise<CartWithItems> {
    const existing = await this.carts.findByGuestToken(guestToken);
    if (existing) {
      return existing;
    }

    try {
      return await this.carts.createForGuest(guestToken);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        const cart = await this.carts.findByGuestToken(guestToken);
        if (cart) {
          return cart;
        }
      }
      throw error;
    }
  }

  private async buildResponse(cartId: string): Promise<CartResponse> {
    const cart = await this.carts.findById(cartId);
    return cart ? CartMapper.toResponse(cart) : CartMapper.empty();
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_UNIQUE_VIOLATION
    );
  }
}
