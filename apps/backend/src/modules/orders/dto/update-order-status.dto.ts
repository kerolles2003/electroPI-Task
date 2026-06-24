import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum, IsIn } from 'class-validator';

import { ADMIN_UPDATABLE_STATUSES } from '../constants/order.constant';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ADMIN_UPDATABLE_STATUSES,
    example: OrderStatus.CONFIRMED,
    description: 'Target status. PENDING is not settable; terminal-state rules apply in the service.',
  })
  @IsEnum(OrderStatus)
  @IsIn(ADMIN_UPDATABLE_STATUSES)
  status!: OrderStatus;
}
