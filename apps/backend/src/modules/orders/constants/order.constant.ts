import { OrderStatus } from '@prisma/client';

/** Default order currency (matches the Prisma schema default). */
export const DEFAULT_ORDER_CURRENCY = 'USD';

/** Delivery fee — flat for this phase (no delivery pricing rules in scope). */
export const DEFAULT_DELIVERY_FEE = 0;

/** Human-friendly order number generation. */
export const ORDER_NUMBER_PREFIX = 'ORD';
export const ORDER_NUMBER_MAX_ATTEMPTS = 5;

/** Statuses an admin may set (PENDING is the initial state, never re-applied). */
export const ADMIN_UPDATABLE_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

/** Terminal statuses — no further transitions allowed out of these. */
export const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];
