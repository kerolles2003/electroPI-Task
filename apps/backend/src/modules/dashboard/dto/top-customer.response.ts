import { ApiProperty } from '@nestjs/swagger';

export class TopCustomerResponse {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k' })
  userId!: string;

  @ApiProperty({ example: 'John Smith' })
  customerName!: string;

  @ApiProperty({ example: 15 })
  ordersCount!: number;
}
