import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const smtpUser = config.get<string>('SMTP_USER', '');
        const domainFromSmtpUser =
          smtpUser.includes('@') ? smtpUser.slice(smtpUser.indexOf('@') + 1) : '';
        const fromExplicit = config.get<string>('SMTP_FROM', '')?.trim();
        const fromDefault =
          domainFromSmtpUser.length > 0
            ? `"Guia do Job" <noreply@${domainFromSmtpUser}>`
            : '"Guia do Job" <noreply@localhost>';

        return {
          transport: {
            host: config.get<string>('SMTP_HOST', 'localhost'),
            port: config.get<number>('SMTP_PORT', 587),
            secure: config.get<string>('SMTP_SECURE', 'false') === 'true',
            auth: {
              user: smtpUser,
              pass: config.get<string>('SMTP_PASS', ''),
            },
          },
          defaults: {
            from: fromExplicit || fromDefault,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
