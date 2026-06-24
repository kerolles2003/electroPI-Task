import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: '4821', description: '4-digit OTP sent to your email address' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}$/, { message: 'otp must be exactly 4 digits' })
  otp!: string;
}
