/**
 * Minimal shape of a Stripe webhook event needed for payment confirmation.
 */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}
