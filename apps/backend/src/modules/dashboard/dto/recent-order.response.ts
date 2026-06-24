import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class RecentOrderResponse {
  @ApiProperty({ example: 'ORD-LT7K2P-9F3A' })
  orderNumber!: string;

  @ApiProperty({ example: 'Jane Doe' })
  customerName!: string;

  @ApiProperty({ example: 4999.98 })
  totalAmount!: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  orderStatus!: OrderStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID, nullable: true })
  paymentStatus!: PaymentStatus | null;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  createdAt!: Date;
}
