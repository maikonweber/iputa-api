import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [AuthModule, ProfilesModule],
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule {}
