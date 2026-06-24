import { BadRequestException } from '@nestjs/common';

export class InvalidResetTokenException extends BadRequestException {
  constructor() {
    super('Password reset token is invalid or has expired');
  }
}
