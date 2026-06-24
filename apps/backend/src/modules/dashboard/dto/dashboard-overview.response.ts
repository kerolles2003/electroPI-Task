import { ApiProperty } from '@nestjs/swagger';

export class DashboardOverviewResponse {
  @ApiProperty({ example: 1234, description: 'Total registered users' })
  totalUsers!: number;

  @ApiProperty({ example: 567, description: 'Total orders placed (all statuses)' })
  totalOrders!: number;

  @ApiProperty({ example: 45678.9, description: 'Sum of all confirmed PAID payments' })
  totalRevenue!: number;

  @ApiProperty({ example: 23, description: 'Orders currently in PENDING status' })
  pendingOrders!: number;

  @ApiProperty({ example: 412, description: 'Orders in DELIVERED (completed) status' })
  completedOrders!: number;
}
