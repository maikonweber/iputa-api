import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { PhotosModule } from './modules/photos/photos.module';
import { CitiesModule } from './modules/cities/cities.module';
import { SearchModule } from './modules/search/search.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { AdminModule } from './modules/admin/admin.module';
import { VideosModule } from './modules/videos/videos.module';
import { StoriesModule } from './modules/stories/stories.module';
import { QueuesModule } from './modules/queues/queues.module';
import { MailModule } from './modules/mail/mail.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { WatermarkModule } from './modules/watermark/watermark.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    QueuesModule,
    MailModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    PhotosModule,
    CitiesModule,
    SearchModule,
    PlansModule,
    SubscriptionsModule,
    AdminModule,
    VideosModule,
    StoriesModule,
    StripeModule,
    WatermarkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
