import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PAYMENT_QUEUE } from './payment-queue.constants';

export type PaymentJobData = {
  type: 'subscription.created' | 'subscription.updated' | 'subscription.deleted';
  subscriptionId: string;
  profileId: string;
  planId: string;
  stripeEventId?: string;
};

@Injectable()
export class PaymentQueueService {
  constructor(@InjectQueue(PAYMENT_QUEUE) private readonly queue: Queue) {}

  async addPaymentEvent(data: PaymentJobData) {
    await this.queue.add(data.type, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }
}
