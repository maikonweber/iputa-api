import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { profiles, videos } from '../../database/schema';
import { StorageService } from '../../storage/storage.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class VideosService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly storage: StorageService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async upload(userId: string, profileId: string, file: Express.Multer.File) {
    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You cannot upload video to this profile');
    }

    const limits = await this.subscriptionsService.getActivePlanLimits(profileId);

    if (limits.maxVideos !== null) {
      const [{ count }] = await this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(videos)
        .where(eq(videos.profileId, profileId));

      if (count >= limits.maxVideos) {
        throw new ForbiddenException(
          `Limite de ${limits.maxVideos} videos atingido para seu plano`,
        );
      }
    }

    const key = this.storage.buildKey(`videos/${profileId}`, file.originalname);
    await this.storage.upload(key, file.buffer, file.mimetype);

    const [video] = await this.drizzle.db
      .insert(videos)
      .values({ profileId, url: key })
      .returning();

    const signedUrl = await this.storage.getSignedUrl(key);

    return { ...video, signedUrl };
  }

  async findByProfile(profileId: string) {
    const profileVideos = await this.drizzle.db.query.videos.findMany({
      where: eq(videos.profileId, profileId),
    });

    return Promise.all(
      profileVideos.map(async (video) => ({
        ...video,
        signedUrl: await this.storage.getSignedUrl(video.url),
      })),
    );
  }

  async remove(userId: string, videoId: string) {
    const video = await this.drizzle.db.query.videos.findFirst({
      where: eq(videos.id, videoId),
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, video.profileId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You cannot delete this video');
    }

    await this.storage.delete(video.url);

    await this.drizzle.db
      .delete(videos)
      .where(and(eq(videos.id, videoId), eq(videos.profileId, video.profileId)));

    return { deleted: true };
  }
}
