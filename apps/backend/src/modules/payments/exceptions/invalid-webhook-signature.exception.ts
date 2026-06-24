import { BadRequestException } from '@nestjs/common';

/**
 * Raised when a Stripe webhook payload fails signature verification.
 */
export class InvalidWebhookSignatureException extends BadRequestException {
  constructor() {
    super('Invalid webhook signature');
  }
}
