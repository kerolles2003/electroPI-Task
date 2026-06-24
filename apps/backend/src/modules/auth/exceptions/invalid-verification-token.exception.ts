import { BadRequestException } from '@nestjs/common';

export class InvalidVerificationTokenException extends BadRequestException {
  constructor() {
    super('Verification token is invalid or has expired');
  }
}
