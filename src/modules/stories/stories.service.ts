import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, gt, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { profiles, stories } from '../../database/schema';
import { StorageService } from '../../storage/storage.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

const STORY_DURATION_HOURS = 24;

@Injectable()
export class StoriesService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly storage: StorageService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async create(userId: string, profileId: string, file: Express.Multer.File) {
    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You cannot create story for this profile');
    }

    const limits = await this.subscriptionsService.getActivePlanLimits(profileId);

    if (limits.maxStories !== null) {
      const [{ count }] = await this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(stories)
        .where(
          and(
            eq(stories.profileId, profileId),
            gt(stories.expiresAt, new Date()),
          ),
        );

      if (count >= limits.maxStories) {
        throw new ForbiddenException(
          limits.maxStories === 0
            ? 'Seu plano nao permite stories'
            : `Limite de ${limits.maxStories} stories ativos atingido para seu plano`,
        );
      }
    }

    const key = this.storage.buildKey(`stories/${profileId}`, file.originalname);
    await this.storage.upload(key, file.buffer, file.mimetype);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + STORY_DURATION_HOURS * 60 * 60 * 1000);

    const [story] = await this.drizzle.db
      .insert(stories)
      .values({ profileId, mediaUrl: key, expiresAt })
      .returning();

    const signedUrl = await this.storage.getSignedUrl(key);

    return { ...story, signedUrl };
  }

  async findActiveByProfile(profileId: string) {
    const activeStories = await this.drizzle.db.query.stories.findMany({
      where: and(
        eq(stories.profileId, profileId),
        gt(stories.expiresAt, new Date()),
      ),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    return Promise.all(
      activeStories.map(async (story) => ({
        ...story,
        signedUrl: await this.storage.getSignedUrl(story.mediaUrl),
      })),
    );
  }

  async remove(userId: string, storyId: string) {
    const story = await this.drizzle.db.query.stories.findFirst({
      where: eq(stories.id, storyId),
    });

    if (!story) {
      throw new NotFoundException('Story not found');
    }

    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, story.profileId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You cannot delete this story');
    }

    await this.storage.delete(story.mediaUrl);

    await this.drizzle.db
      .delete(stories)
      .where(eq(stories.id, storyId));

    return { deleted: true };
  }
}
