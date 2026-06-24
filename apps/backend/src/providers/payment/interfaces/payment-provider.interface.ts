export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export interface PaymentResult {
  success: boolean;
  reference: string;
}

/**
 * Payment contract. Implementations (Stripe, cash-on-delivery, etc.) are
 * swappable behind the PAYMENT_PROVIDER token. Extend per feature.
 */
export interface PaymentProvider {
  charge(amount: number, currency: string, reference: string): Promise<PaymentResult>;
}
