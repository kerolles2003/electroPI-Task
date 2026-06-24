import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 'clx0a1b2c3d4e5f6g7h8i9j0k', description: 'Address id (must belong to the user)' })
  @IsString()
  @MinLength(1)
  addressId!: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH_ON_DELIVERY })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ maxLength: 1000, description: 'Optional order note' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
