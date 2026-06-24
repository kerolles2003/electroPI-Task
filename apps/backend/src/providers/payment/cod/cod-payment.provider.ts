import { Injectable } from '@nestjs/common';
import { PaymentMethod, PaymentProvider as PaymentProviderName } from '@prisma/client';

import { InitiatePaymentResult, PaymentProvider } from '../interfaces/payment-provider.interface';

/**
 * Cash-on-delivery: no upfront charge, no external reference, no redirect.
 * The payment is settled physically on delivery; status stays PENDING until then.
 */
@Injectable()
export class CodPaymentProvider implements PaymentProvider {
  readonly method = PaymentMethod.CASH_ON_DELIVERY;
  readonly provider = PaymentProviderName.CASH_ON_DELIVERY;

  async initiate(): Promise<InitiatePaymentResult> {
    return { transactionRef: null, checkoutUrl: null };
  }
}
