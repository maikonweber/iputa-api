import { Injectable } from '@nestjs/common';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { cities, profiles } from '../../database/schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(userId: string, dto: CreateProfileDto) {
    const city = await this.drizzle.db.query.cities.findFirst({
      where: eq(cities.id, dto.cityId),
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    const [profile] = await this.drizzle.db
      .insert(profiles)
      .values({
        userId,
        name: dto.name,
        gender: dto.gender,
        age: dto.age,
        description: dto.description,
        whatsapp: dto.whatsapp,
        cityId: dto.cityId,
        neighborhood: dto.neighborhood,
        priceHour: dto.priceHour.toFixed(2),
        active: dto.active ?? true,
      })
      .returning();

    return profile;
  }

  findAll() {
    return this.drizzle.db.query.profiles.findMany({
      where: eq(profiles.active, true),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
  }

  async findOne(id: string) {
    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, id),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(userId: string, id: string, dto: UpdateProfileDto) {
    const existing = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, id),
    });

    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('You cannot edit this profile');
    }

    const [profile] = await this.drizzle.db
      .update(profiles)
      .set({
        name: dto.name,
        gender: dto.gender,
        age: dto.age,
        description: dto.description,
        whatsapp: dto.whatsapp,
        cityId: dto.cityId,
        neighborhood: dto.neighborhood,
        priceHour: dto.priceHour !== undefined ? dto.priceHour.toFixed(2) : undefined,
        active: dto.active,
      })
      .where(and(eq(profiles.id, id), eq(profiles.userId, userId)))
      .returning();

    return profile;
  }

  async remove(userId: string, id: string) {
    const [profile] = await this.drizzle.db
      .delete(profiles)
      .where(and(eq(profiles.id, id), eq(profiles.userId, userId)))
      .returning({ id: profiles.id });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return { deleted: true };
  }
}
