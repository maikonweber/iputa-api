import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../../mail/mail.service';
import { EMAIL_QUEUE } from './email-queue.constants';
import { EmailJobData } from './email-queue.service';

@Processor(EMAIL_QUEUE)
export class EmailQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailQueueProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id} (${job.data.type})`);

    switch (job.data.type) {
      case 'welcome':
        await this.mailService.sendWelcome(job.data.email);
        break;
      case 'forgot-password':
        await this.mailService.sendPasswordReset(job.data.email, job.data.token);
        break;
      default:
        this.logger.warn(`Unknown email job type: ${(job.data as any).type}`);
    }
  }
}
