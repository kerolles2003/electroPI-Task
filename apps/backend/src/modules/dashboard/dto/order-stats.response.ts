import { ApiProperty } from '@nestjs/swagger';

export class RevenueOverviewResponse {
  @ApiProperty({ example: 99999.99, description: 'Gross order value: sum of totalAmount for all non-cancelled orders' })
  total!: number;

  @ApiProperty({ example: 84999.99, description: 'Sum of PAID payment amounts' })
  paid!: number;

  @ApiProperty({ example: 12000.0, description: 'Sum of PAID Cash-on-Delivery payment amounts' })
  cod!: number;
}

export class OrderDistributionResponse {
  @ApiProperty({ example: 12 })
  pending!: number;

  @ApiProperty({ example: 34 })
  confirmed!: number;

  @ApiProperty({ example: 8 })
  preparing!: number;

  @ApiProperty({ example: 5 })
  outForDelivery!: number;

  @ApiProperty({ example: 412 })
  delivered!: number;

  @ApiProperty({ example: 7 })
  cancelled!: number;
}

export class OrderStatsResponse {
  @ApiProperty({ type: RevenueOverviewResponse })
  revenue!: RevenueOverviewResponse;

  @ApiProperty({ type: OrderDistributionResponse })
  distribution!: OrderDistributionResponse;
}
