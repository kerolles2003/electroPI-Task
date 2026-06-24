import { BadRequestException } from '@nestjs/common';

/**
 * Raised when no provider is registered for the requested payment method.
 * Defensive — DTO validation already constrains the accepted methods.
 */
export class UnsupportedPaymentMethodException extends BadRequestException {
  constructor() {
    super('Unsupported payment method');
  }
}
