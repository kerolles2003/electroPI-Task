export const MAIL_PROVIDER = 'MAIL_PROVIDER';

/**
 * Domain-level email contract. Each method maps 1-to-1 with a business event.
 * Implementations (Resend, SendGrid, etc.) are swappable behind the token.
 * HTML construction lives in templates — never inside implementations.
 */
export interface MailProvider {
  sendVerificationEmail(to: string, name: string, otp: string): Promise<void>;
  sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void>;
  sendWelcomeEmail(to: string, name: string): Promise<void>;
}
