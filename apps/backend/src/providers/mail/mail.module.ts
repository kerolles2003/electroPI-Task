import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BrevoMailProvider } from './brevo/brevo-mail.provider';
import { MAIL_PROVIDER, MailProvider } from './interfaces/mail-provider.interface';
import { LocalMailProvider } from './local/local-mail.provider';
import { ResendMailProvider } from './resend/resend-mail.provider';

@Module({
  providers: [
    ResendMailProvider,
    BrevoMailProvider,
    LocalMailProvider,
    {
      provide: MAIL_PROVIDER,
      // The active provider is selected by MAIL_PROVIDER env var at startup.
      // All three implementations are instantiated so their constructors validate
      // config eagerly. The factory chooses which one to bind to the token.
      useFactory: (
        config: ConfigService,
        resend: ResendMailProvider,
        brevo: BrevoMailProvider,
        local: LocalMailProvider,
      ): MailProvider => {
        const provider = config.get<string>('mail.provider') ?? 'local';
        switch (provider) {
          case 'resend':
            return resend;
          case 'brevo':
            return brevo;
          case 'local':
            return local;
          default:
            throw new Error(
              `Unknown MAIL_PROVIDER "${provider}". Allowed values: resend | brevo | local`,
            );
        }
      },
      inject: [ConfigService, ResendMailProvider, BrevoMailProvider, LocalMailProvider],
    },
  ],
  exports: [MAIL_PROVIDER],
})
export class MailModule {}
