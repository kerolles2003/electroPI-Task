import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailProvider } from '../interfaces/mail-provider.interface';
import { resetPasswordTemplate } from '../templates/reset-password.template';
import { verifyEmailTemplate } from '../templates/verify-email.template';
import { welcomeTemplate } from '../templates/welcome.template';

@Injectable()
export class BrevoMailProvider implements MailProvider {
  private readonly apiKey: string;
  private readonly senderName: string;
  private readonly senderEmail: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('mail.brevo.apiKey') ?? '';
    this.senderName = this.config.get<string>('mail.brevo.senderName') ?? 'electro-PI';
    this.senderEmail = this.config.get<string>('mail.brevo.senderEmail') ?? 'noreply@electro-pi.com';
  }

  sendVerificationEmail(to: string, name: string, otp: string): Promise<void> {
    return this.send(to, 'Verify your email address', verifyEmailTemplate({ name, otp }));
  }

  sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
    return this.send(to, 'Reset your password', resetPasswordTemplate({ name, resetUrl }));
  }

  sendWelcomeEmail(to: string, name: string): Promise<void> {
    return this.send(to, 'Welcome to electro-PI', welcomeTemplate({ name }));
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error(
        'BrevoMailProvider: BREVO_API_KEY is not configured. Use MAIL_PROVIDER=local for development.',
      );
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: this.senderName, email: this.senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Brevo API error ${response.status}: ${body}`);
    }
  }
}
