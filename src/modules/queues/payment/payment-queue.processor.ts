import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PAYMENT_QUEUE } from './payment-queue.constants';
import { PaymentJobData } from './payment-queue.service';

@Processor(PAYMENT_QUEUE)
export class PaymentQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentQueueProcessor.name);

  async process(job: Job<PaymentJobData>): Promise<void> {
    this.logger.log(`Processing payment job ${job.id} (${job.data.type})`);
    this.logger.log(`Subscription: ${job.data.subscriptionId}, Profile: ${job.data.profileId}`);
  }
}
