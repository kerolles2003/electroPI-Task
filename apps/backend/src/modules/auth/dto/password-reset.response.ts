import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetResponse {
  @ApiProperty({ example: 'If that email exists, a reset link has been sent' })
  message!: string;
}
