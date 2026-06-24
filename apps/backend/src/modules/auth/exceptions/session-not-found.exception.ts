import { NotFoundException } from '@nestjs/common';

export class SessionNotFoundException extends NotFoundException {
  constructor() {
    super('Session not found or does not belong to this user');
  }
}
