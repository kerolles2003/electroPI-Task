import { Injectable } from '@nestjs/common';

import { MailProvider } from '../interfaces/mail-provider.interface';

@Injectable()
export class ResendMailProvider implements MailProvider {
  sendMail(_to: string, _subject: string, _html: string): Promise<void> {
    throw new Error('ResendMailProvider.sendMail not implemented yet');
  }
}
