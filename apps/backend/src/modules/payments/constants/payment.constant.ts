/**
 * Payment/Stripe constants, centralized to avoid magic strings across the
 * webhook controller, service, and configuration.
 */

// ---- Stripe webhook event types ----
/** Confirms a successful Checkout payment → Payment becomes PAID. */
export const STRIPE_CHECKOUT_COMPLETED_EVENT = 'checkout.session.completed';
/** Async payment attempt failed → Payment becomes FAILED (while still PENDING). */
export const STRIPE_CHECKOUT_FAILED_EVENT = 'checkout.session.async_payment_failed';

// ---- Webhook header ----
/** Header carrying the Stripe signature used to verify the raw payload. */
export const STRIPE_SIGNATURE_HEADER = 'stripe-signature';

/**
 * Max age (in seconds) of a webhook event's signed timestamp before it is
 * rejected as a potential replay. Matches Stripe's default tolerance.
 */
export const WEBHOOK_SIGNATURE_TOLERANCE_SECONDS = 300;

// ---- Default redirect URL paths (appended to FRONTEND_URL) ----
export const DEFAULT_STRIPE_SUCCESS_PATH = '/checkout/success';
export const DEFAULT_STRIPE_CANCEL_PATH = '/checkout/cancel';
