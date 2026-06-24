import { Inject, Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentProvider as PaymentProviderName } from '@prisma/client';

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

  /** Marks a COD payment as collected when the order is delivered. No-op for non-COD. */
  async markCodPaidByOrder(orderId: string): Promise<void> {
    await this.payments.markCodPaidByOrder(orderId);
  }

  /**
   * Verifies and processes a Stripe webhook.
   *
   * Idempotency guarantees:
   * - Duplicate / retried deliveries are safe: the status transitions are atomic
   *   conditional updates (guarded in the WHERE clause by the current status), so
   *   the same event applied twice converges to a single transition.
   * - PaymentStatus only ever changes once out of PENDING — `completed` sets PAID
   *   only if not already PAID, and `async_payment_failed` sets FAILED only while
   *   still PENDING, so a FAILED event can never override an already-PAID payment.
   * - Unknown event types, unmatched references, and already-settled payments are
   *   all no-ops.
   *
   * Webhook-vs-checkout race: the event may arrive before our own
   * `attachTransactionRef` has persisted the session id. In that case the payment
   * is resolved by `client_reference_id` (the order number) and the session id is
   * back-filled, so the confirmation is never lost.
   *
   * Order and Payment lifecycles are independent — OrderStatus is never modified.
   */
  async handleStripeWebhook(payload: Buffer | undefined, signature: string | undefined): Promise<void> {
    if (!payload) {
      throw new InvalidWebhookSignatureException();
    }

    const event = this.stripeWebhook.constructEvent(payload, signature);

    const object = event.data.object;
    const sessionId = typeof object.id === 'string' ? object.id : null;
    const orderNumber =
      typeof object.client_reference_id === 'string' ? object.client_reference_id : null;

    let payment = sessionId ? await this.payments.findByTransactionRef(sessionId) : null;
    if (!payment && orderNumber) {
      // The webhook outran our transactionRef write — resolve by order number and
      // back-fill the session id so later lookups (and audits) stay consistent.
      payment = await this.payments.findByOrderNumber(orderNumber);
      if (payment && sessionId && !payment.transactionRef) {
        await this.payments.setTransactionRefByOrder(payment.orderId, sessionId);
      }
    }
    if (!payment) {
      return;
    }

    // Atomic, idempotent transitions — the repository enforces the status guards.
    if (event.type === STRIPE_CHECKOUT_COMPLETED_EVENT) {
      await this.payments.markPaid(payment.id);
    } else if (event.type === STRIPE_CHECKOUT_FAILED_EVENT) {
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
