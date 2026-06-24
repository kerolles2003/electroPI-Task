import { Controller, Headers, HttpCode, HttpStatus, Post, RawBodyRequest, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { Public } from '../../common/decorators/public.decorator';
import { STRIPE_SIGNATURE_HEADER } from './constants/payment.constant';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('webhook/stripe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe payment webhook (signature-verified, raw body)' })
  @ApiOkResponse({ description: 'Event received' })
  @ApiBadRequestResponse({ description: 'Invalid webhook signature' })
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers(STRIPE_SIGNATURE_HEADER) signature: string,
  ): Promise<{ received: boolean }> {
    await this.payments.handleStripeWebhook(req.rawBody, signature);
    return { received: true };
  }
}
