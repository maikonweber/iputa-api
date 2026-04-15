import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailQueueModule } from './email/email-queue.module';
import { PaymentQueueModule } from './payment/payment-queue.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', '127.0.0.1'),
          port: config.get<number>('REDIS_PORT', 6380),
        },
      }),
    }),
    EmailQueueModule,
    PaymentQueueModule,
  ],
  exports: [EmailQueueModule, PaymentQueueModule],
})
export class QueuesModule {}
