import { CartItemResponse } from '../dto/cart-item.response';
import { CartResponse } from '../dto/cart.response';
import { CartWithItems } from '../repositories/cart.repository';

type CartItemWithProduct = CartWithItems['items'][number];

/** Rounds to 2 decimal places, guarding against binary float drift. */
function toMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Maps the persisted Cart aggregate to its public representation, computing
 * per-line and cart-level totals.
 */
export class CartMapper {
  static toResponse(cart: CartWithItems): CartResponse {
    const items = cart.items.map((item) => this.toItem(item));
    const subtotal = toMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, subtotal, totalItems };
  }

  static empty(): CartResponse {
    return { items: [], subtotal: 0, totalItems: 0 };
  }

  private static toItem(item: CartItemWithProduct): CartItemResponse {
    const unitPrice = Number(item.product.price);
    const lineTotal = toMoney(unitPrice * item.quantity);

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      product: {
        id: item.product.id,
        slug: item.product.slug,
        nameEn: item.product.nameEn,
        nameAr: item.product.nameAr,
        price: unitPrice,
        imageUrl: item.product.imageUrl,
        isAvailable: item.product.isAvailable,
      },
    };
  }
}
