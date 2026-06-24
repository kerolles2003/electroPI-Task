import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: '123 Main St, Cairo, Egypt', description: 'Delivery address' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  deliveryAddress!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH_ON_DELIVERY })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ maxLength: 1000, description: 'Optional order note' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
