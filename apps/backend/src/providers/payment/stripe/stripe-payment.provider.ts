import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod, PaymentProvider as PaymentProviderName } from '@prisma/client';

import {
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
} from '../interfaces/payment-provider.interface';

const STRIPE_CHECKOUT_SESSIONS_URL = 'https://api.stripe.com/v1/checkout/sessions';

/**
 * Online payments via Stripe Checkout. Talks to Stripe's REST API directly with
 * the runtime `fetch` global (no vendor SDK dependency). Creates a hosted
 * checkout session and returns its id (persisted as the transaction reference)
 * and redirect URL.
 */
@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  readonly method = PaymentMethod.ONLINE;
  readonly provider = PaymentProviderName.STRIPE;

  constructor(private readonly config: ConfigService) {}

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const secretKey = this.config.getOrThrow<string>('payment.stripe.secretKey');
    const successUrl = this.config.getOrThrow<string>('payment.stripe.successUrl');
    const cancelUrl = this.config.getOrThrow<string>('payment.stripe.cancelUrl');

    const form = new URLSearchParams();
    form.set('mode', 'payment');
    form.set('success_url', successUrl);
    form.set('cancel_url', cancelUrl);
    form.set('client_reference_id', input.orderNumber);
    if (input.customerEmail) {
      form.set('customer_email', input.customerEmail);
    }
    // Single aggregated line item for the order total (itemization is out of scope).
    form.set('line_items[0][quantity]', '1');
    form.set('line_items[0][price_data][currency]', input.currency.toLowerCase());
    form.set('line_items[0][price_data][unit_amount]', String(Math.round(input.amount * 100)));
    form.set('line_items[0][price_data][product_data][name]', `Order ${input.orderNumber}`);

    const response = await fetch(STRIPE_CHECKOUT_SESSIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new InternalServerErrorException(
        `Stripe checkout session creation failed (${response.status}): ${detail}`,
      );
    }

    const session = (await response.json()) as { id: string; url: string | null };
    return { transactionRef: session.id, checkoutUrl: session.url };
  }
}
