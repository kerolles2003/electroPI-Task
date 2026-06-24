import { PaymentMethod, PaymentProvider as PaymentProviderName } from '@prisma/client';

// Injection tokens — one per concrete implementation so the orchestrating
// service can hold both and dispatch by PaymentMethod.
export const STRIPE_PAYMENT_PROVIDER = 'STRIPE_PAYMENT_PROVIDER';
export const COD_PAYMENT_PROVIDER = 'COD_PAYMENT_PROVIDER';

export interface InitiatePaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail?: string;
}

export interface InitiatePaymentResult {
  /** External reference (e.g. Stripe Checkout Session id); null for COD. */
  transactionRef: string | null;
  /** Hosted payment page to redirect the customer to; null for COD. */
  checkoutUrl: string | null;
}

/**
 * Payment contract. Implementations (Stripe, cash-on-delivery, etc.) are
 * swappable behind their injection tokens. Each declares the PaymentMethod it
 * serves and the PaymentProvider value it records on the Payment row.
 */
export interface PaymentProvider {
  readonly method: PaymentMethod;
  readonly provider: PaymentProviderName;
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
}
