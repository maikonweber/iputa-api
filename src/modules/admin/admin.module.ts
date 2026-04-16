import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AdminController } from './admin.controller';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [AuthModule, SubscriptionsModule],
  controllers: [AdminController, AdminSubscriptionsController],
  providers: [AdminService],
})
export class AdminModule {}
