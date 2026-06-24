/**
 * User-facing order error messages, centralized so exception classes share a
 * single source of truth instead of inline magic strings.
 */
export const ORDER_NOT_FOUND_MESSAGE = 'Order not found';
export const ORDER_ALREADY_TERMINAL_MESSAGE =
  'Order status can no longer be changed from a terminal state';
export const EMPTY_CART_CHECKOUT_MESSAGE = 'Cart is empty';
export const ADDRESS_NOT_FOUND_MESSAGE = 'Address not found';
export const CHECKOUT_PRODUCT_UNAVAILABLE_MESSAGE =
  'One or more products in the cart are no longer available';
