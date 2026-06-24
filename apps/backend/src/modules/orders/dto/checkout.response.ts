import { ApiProperty } from '@nestjs/swagger';

import { OrderResponse } from './order.response';

/**
 * Result of checkout: the created order plus, for ONLINE payments, the Stripe
 * hosted checkout URL the client should redirect to (null for COD).
 */
export class CheckoutResponse {
  @ApiProperty({ type: OrderResponse })
  order!: OrderResponse;

  @ApiProperty({
    example: 'https://checkout.stripe.com/c/pay/cs_test_a1b2c3',
    nullable: true,
    description: 'Redirect URL for ONLINE payments; null for cash on delivery',
  })
  checkoutUrl!: string | null;
}
