import { ApiProperty } from '@nestjs/swagger';

export class EmailVerificationResponse {
  @ApiProperty({ example: 'Email verified successfully' })
  message!: string;
}
