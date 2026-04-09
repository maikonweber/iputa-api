import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { photos, profiles } from '../../database/schema';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class PhotosService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly storage: StorageService,
  ) {}

  async upload(userId: string, profileId: string, file: Express.Multer.File) {
    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You cannot upload photo to this profile');
    }

    const key = this.storage.buildKey(`photos/${profileId}`, file.originalname);
    await this.storage.upload(key, file.buffer, file.mimetype);

    const [photo] = await this.drizzle.db
      .insert(photos)
      .values({ profileId, url: key, isPrimary: false })
      .returning();

    const signedUrl = await this.storage.getSignedUrl(key);

    return { ...photo, signedUrl };
  }

  async findByProfile(profileId: string) {
    const profilePhotos = await this.drizzle.db.query.photos.findMany({
      where: eq(photos.profileId, profileId),
    });

    return Promise.all(
      profilePhotos.map(async (photo) => ({
        ...photo,
        signedUrl: await this.storage.getSignedUrl(photo.url),
      })),
    );
  }

  async getSignedUrl(userId: string, photoId: string) {
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
      throw new ForbiddenException('You cannot access this photo');
    }

    const signedUrl = await this.storage.getSignedUrl(photo.url);

    return { photoId, signedUrl };
  }

  async remove(userId: string, photoId: string) {
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

    await this.storage.delete(photo.url);

    await this.drizzle.db
      .delete(photos)
      .where(
        and(eq(photos.id, photoId), eq(photos.profileId, photo.profileId)),
      );

    return { deleted: true };
  }
}
