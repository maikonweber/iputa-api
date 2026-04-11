import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly appUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.appUrl = this.configService.get<string>('APP_URL', 'http://localhost:4000');
  }

  async sendWelcome(email: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Bem-vindo ao Guia do Job',
        template: 'welcome',
        context: { email, appUrl: this.appUrl },
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
    }
  }

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `${this.appUrl}/auth/reset-password?token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Recuperacao de senha - Guia do Job',
        template: 'forgot-password',
        context: { email, resetUrl, appUrl: this.appUrl },
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
    }
  }
}
