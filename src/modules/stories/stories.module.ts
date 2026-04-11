import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../../storage/storage.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [AuthModule, StorageModule, SubscriptionsModule],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
