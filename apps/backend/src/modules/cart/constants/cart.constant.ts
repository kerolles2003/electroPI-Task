/**
 * Cart module constants. Centralized to avoid magic values across the cookie
 * service, DTOs, and controller.
 */

/** Cookie carrying the anonymous guest-cart identifier. */
export const GUEST_CART_COOKIE = 'guest_cart_token';

/** Guest carts linger for 30 days so anonymous sessions survive across visits. */
export const GUEST_CART_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** A cart line must always hold at least one unit. */
export const MIN_CART_ITEM_QUANTITY = 1;
