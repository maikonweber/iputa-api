import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE } from './email-queue.constants';

export type EmailJobData =
  | { type: 'welcome'; email: string }
  | { type: 'forgot-password'; email: string; token: string };

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue(EMAIL_QUEUE) private readonly queue: Queue) {}

  async addWelcomeEmail(email: string) {
    await this.queue.add('welcome', { type: 'welcome', email } satisfies EmailJobData);
  }

  async addForgotPasswordEmail(email: string, token: string) {
    await this.queue.add('forgot-password', {
      type: 'forgot-password',
      email,
      token,
    } satisfies EmailJobData);
  }
}
