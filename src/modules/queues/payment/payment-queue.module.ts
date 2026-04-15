import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PAYMENT_QUEUE } from './payment-queue.constants';
import { PaymentQueueService } from './payment-queue.service';
import { PaymentQueueProcessor } from './payment-queue.processor';

@Module({
  imports: [BullModule.registerQueue({ name: PAYMENT_QUEUE })],
  providers: [PaymentQueueService, PaymentQueueProcessor],
  exports: [PaymentQueueService],
})
export class PaymentQueueModule {}
