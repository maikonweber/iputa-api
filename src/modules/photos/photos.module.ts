import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { StorageModule } from '../../storage/storage.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { WatermarkModule } from '../watermark/watermark.module';

@Module({
  imports: [AuthModule, ProfilesModule, StorageModule, SubscriptionsModule, WatermarkModule],
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule {}
