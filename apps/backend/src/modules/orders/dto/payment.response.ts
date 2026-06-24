import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/client';

/**
 * Payment view for an order. The payment lifecycle is independent of the order
 * status lifecycle.
 */
export class PaymentResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  id!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH_ON_DELIVERY })
  method!: PaymentMethod;

  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.CASH_ON_DELIVERY })
  provider!: PaymentProvider;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @ApiProperty({ example: 4999.98 })
  amount!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: 'cs_test_a1b2c3', nullable: true, description: 'Stripe session id; null for COD' })
  transactionRef!: string | null;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z', nullable: true })
  paidAt!: Date | null;
}
