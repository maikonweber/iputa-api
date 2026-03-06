import { Injectable } from '@nestjs/common';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { photos, profiles } from '../../database/schema';

@Injectable()
export class PhotosService {
  constructor(private readonly drizzle: DrizzleService) {}

  async upload(userId: number, profileId: number, filePath: string) {
    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You cannot upload photo to this profile');
    }

    const [photo] = await this.drizzle.db
      .insert(photos)
      .values({
        profileId,
        url: filePath,
        isPrimary: false,
      })
      .returning();

    return photo;
  }

  async remove(userId: number, photoId: number) {
    const photo = await this.drizzle.db.query.photos.findFirst({
      where: eq(photos.id, photoId),
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, photo.profileId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You cannot delete this photo');
    }

    await this.drizzle.db
      .delete(photos)
      .where(and(eq(photos.id, photoId), eq(photos.profileId, photo.profileId)));

    return { deleted: true };
  }
}
