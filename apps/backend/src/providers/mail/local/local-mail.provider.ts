import { Injectable, Logger } from '@nestjs/common';

import { MailProvider } from '../interfaces/mail-provider.interface';

/**
 * Development / test provider — logs email events to the console.
 * Never makes network calls; safe to use without any API credentials.
 * Select with MAIL_PROVIDER=local (the default when NODE_ENV != production).
 */
@Injectable()
export class LocalMailProvider implements MailProvider {
  private readonly logger = new Logger(LocalMailProvider.name);

  sendVerificationEmail(to: string, name: string, otp: string): Promise<void> {
    this.logger.log(`[verify-email] to="${to}" name="${name}" otp=${otp}`);
    return Promise.resolve();
  }

  sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
    this.logger.log(`[password-reset] to="${to}" name="${name}" url=${resetUrl}`);
    return Promise.resolve();
  }

  sendWelcomeEmail(to: string, name: string): Promise<void> {
    this.logger.log(`[welcome] to="${to}" name="${name}"`);
    return Promise.resolve();
  }
}
