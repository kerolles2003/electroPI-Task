import { Injectable } from '@nestjs/common';

import { PaymentProvider, PaymentResult } from '../interfaces/payment-provider.interface';

@Injectable()
export class StripePaymentProvider implements PaymentProvider {
  charge(_amount: number, _currency: string, _reference: string): Promise<PaymentResult> {
    throw new Error('StripePaymentProvider.charge not implemented yet');
  }
}
