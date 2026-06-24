import { Inject, Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentProvider as PaymentProviderName, PaymentStatus } from '@prisma/client';

import {
  COD_PAYMENT_PROVIDER,
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
  STRIPE_PAYMENT_PROVIDER,
} from '../../providers/payment/interfaces/payment-provider.interface';
import {
  STRIPE_CHECKOUT_COMPLETED_EVENT,
  STRIPE_CHECKOUT_FAILED_EVENT,
} from './constants/payment.constant';
import { InvalidWebhookSignatureException } from './exceptions/invalid-webhook-signature.exception';
import { UnsupportedPaymentMethodException } from './exceptions/unsupported-payment-method.exception';
import { PaymentRepository } from './repositories/payment.repository';
import { StripeWebhookService } from './services/stripe-webhook.service';

/**
 * Orchestrates payment providers behind the PaymentProvider abstraction and
 * handles Stripe webhook confirmation. Order and Payment lifecycles are
 * independent: the webhook only mutates PaymentStatus, never OrderStatus.
 */
@Injectable()
export class PaymentsService {
  private readonly providers: Map<PaymentMethod, PaymentProvider>;

  constructor(
    @Inject(STRIPE_PAYMENT_PROVIDER) stripe: PaymentProvider,
    @Inject(COD_PAYMENT_PROVIDER) cod: PaymentProvider,
    private readonly payments: PaymentRepository,
    private readonly stripeWebhook: StripeWebhookService,
  ) {
    this.providers = new Map<PaymentMethod, PaymentProvider>([
      [stripe.method, stripe],
      [cod.method, cod],
    ]);
  }

  /** The PaymentProvider value recorded for a given method (e.g. ONLINE → STRIPE). */
  providerNameFor(method: PaymentMethod): PaymentProviderName {
    return this.resolve(method).provider;
  }

  /** Initiates payment with the provider serving the method (creates the session for Stripe). */
  initiate(method: PaymentMethod, input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    return this.resolve(method).initiate(input);
  }

  async attachTransactionRef(orderId: string, transactionRef: string): Promise<void> {
    await this.payments.setTransactionRefByOrder(orderId, transactionRef);
  }

  /** Records a payment failure (e.g. provider initiation failed) without touching the order. */
  async markFailedByOrder(orderId: string): Promise<void> {
    await this.payments.markFailedByOrder(orderId);
  }

  /**
   * Verifies and processes a Stripe webhook.
   *
   * Idempotency guarantees:
   * - Duplicate / retried deliveries are safe: Stripe may deliver the same event
   *   more than once, and processing is gated on the Payment's current status.
   * - PaymentStatus only ever changes once out of PENDING — `completed` sets PAID
   *   only if not already PAID, and `async_payment_failed` sets FAILED only while
   *   still PENDING, so a FAILED event can never override an already-PAID payment.
   * - Unknown event types, unmatched references, and already-settled payments are
   *   all no-ops.
   *
   * Order and Payment lifecycles are independent — OrderStatus is never modified.
   */
  async handleStripeWebhook(payload: Buffer | undefined, signature: string | undefined): Promise<void> {
    if (!payload) {
      throw new InvalidWebhookSignatureException();
    }

    const event = this.stripeWebhook.constructEvent(payload, signature);

    const sessionId = typeof event.data.object.id === 'string' ? event.data.object.id : null;
    if (!sessionId) {
      return;
    }

    const payment = await this.payments.findByTransactionRef(sessionId);
    if (!payment) {
      return;
    }

    if (event.type === STRIPE_CHECKOUT_COMPLETED_EVENT && payment.status !== PaymentStatus.PAID) {
      await this.payments.markPaid(payment.id);
    } else if (
      event.type === STRIPE_CHECKOUT_FAILED_EVENT &&
      payment.status === PaymentStatus.PENDING
    ) {
      await this.payments.markFailed(payment.id);
    }
  }

  private resolve(method: PaymentMethod): PaymentProvider {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new UnsupportedPaymentMethodException();
    }
    return provider;
  }
}
