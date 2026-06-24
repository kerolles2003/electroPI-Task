import { ConflictException } from '@nestjs/common';

export class EmailAlreadyVerifiedException extends ConflictException {
  constructor() {
    super('Email address is already verified');
  }
}
