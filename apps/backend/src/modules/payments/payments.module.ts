import { Module } from '@nestjs/common';

import { CodPaymentProvider } from '../../providers/payment/cod/cod-payment.provider';
import {
  COD_PAYMENT_PROVIDER,
  STRIPE_PAYMENT_PROVIDER,
} from '../../providers/payment/interfaces/payment-provider.interface';
import { StripePaymentProvider } from '../../providers/payment/stripe/stripe-payment.provider';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './repositories/payment.repository';
import { StripeWebhookService } from './services/stripe-webhook.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentRepository,
    StripeWebhookService,
    // Provider injection: each PaymentMethod resolves to its implementation.
    { provide: STRIPE_PAYMENT_PROVIDER, useClass: StripePaymentProvider },
    { provide: COD_PAYMENT_PROVIDER, useClass: CodPaymentProvider },
  ],
  // PaymentsService is consumed by the orders module during checkout.
  exports: [PaymentsService],
})
export class PaymentsModule {}
