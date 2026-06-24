import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

import { OrderItemResponse } from './order-item.response';
import { PaymentResponse } from './payment.response';

export class OrderResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  id!: string;

  @ApiProperty({ example: 'ORD-LT7K2P-9F3A' })
  orderNumber!: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PENDING })
  status!: OrderStatus;

  @ApiProperty({ example: 4999.98 })
  subtotalAmount!: number;

  @ApiProperty({ example: 0 })
  deliveryFee!: number;

  @ApiProperty({ example: 4999.98 })
  totalAmount!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: 'Leave at the door', nullable: true })
  notes!: string | null;

  @ApiProperty({ example: '123 Main St, Cairo, Egypt' })
  deliveryAddress!: string;

  @ApiProperty({ type: [OrderItemResponse] })
  items!: OrderItemResponse[];

  @ApiProperty({ type: PaymentResponse, nullable: true })
  payment!: PaymentResponse | null;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-24T00:00:00.000Z' })
  updatedAt!: Date;
}
