export const MAIL_PROVIDER = 'MAIL_PROVIDER';

/**
 * Transactional email contract. Implementations (Resend, etc.) are swappable
 * behind the MAIL_PROVIDER token. Kept intentionally minimal; extend per feature.
 */
export interface MailProvider {
  sendMail(to: string, subject: string, html: string): Promise<void>;
}
