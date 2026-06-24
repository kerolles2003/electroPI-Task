import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';

import { WEBHOOK_SIGNATURE_TOLERANCE_SECONDS } from '../constants/payment.constant';
import { InvalidWebhookSignatureException } from '../exceptions/invalid-webhook-signature.exception';
import { StripeWebhookEvent } from '../interfaces/stripe-event.interface';

/**
 * Verifies Stripe webhook signatures and parses the event, reimplementing
 * Stripe's `constructEvent` scheme with `node:crypto` (no vendor SDK).
 *
 * The `Stripe-Signature` header is `t=<timestamp>,v1=<sig>[,v1=<sig>...]`; the
 * signed payload is `<timestamp>.<rawBody>`, HMAC-SHA256 with the webhook secret.
 */
@Injectable()
export class StripeWebhookService {
  constructor(private readonly config: ConfigService) {}

  constructEvent(payload: Buffer, signatureHeader: string | undefined): StripeWebhookEvent {
    if (!signatureHeader) {
      throw new InvalidWebhookSignatureException();
    }

    const secret = this.config.getOrThrow<string>('payment.stripe.webhookSecret');
    const { timestamp, signatures } = this.parseSignatureHeader(signatureHeader);
    if (!timestamp || signatures.length === 0) {
      throw new InvalidWebhookSignatureException();
    }

    const signedPayload = `${timestamp}.${payload.toString('utf8')}`;
    const expected = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

    const matches = signatures.some((candidate) => this.secureCompare(expected, candidate));
    if (!matches) {
      throw new InvalidWebhookSignatureException();
    }

    // Replay protection: reject events whose signed timestamp is outside the
    // tolerance window, even if the signature itself is valid.
    const eventTimeSeconds = Number(timestamp);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
      !Number.isFinite(eventTimeSeconds) ||
      Math.abs(nowSeconds - eventTimeSeconds) > WEBHOOK_SIGNATURE_TOLERANCE_SECONDS
    ) {
      throw new InvalidWebhookSignatureException();
    }

    return JSON.parse(payload.toString('utf8')) as StripeWebhookEvent;
  }

  private parseSignatureHeader(header: string): { timestamp: string | null; signatures: string[] } {
    let timestamp: string | null = null;
    const signatures: string[] = [];

    for (const part of header.split(',')) {
      const [key, value] = part.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1' && value) {
        signatures.push(value);
      }
    }

    return { timestamp, signatures };
  }

  private secureCompare(a: string, b: string): boolean {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    if (bufferA.length !== bufferB.length) {
      return false;
    }
    return timingSafeEqual(bufferA, bufferB);
  }
}
