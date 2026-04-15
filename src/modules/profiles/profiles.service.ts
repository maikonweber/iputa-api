import { Injectable } from '@nestjs/common';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, desc, sql } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { cities, plans, profiles, subscriptions } from '../../database/schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PROFILE_CATEGORIES } from './constants/profile-categories';

@Injectable()
export class ProfilesService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(userId: string, dto: CreateProfileDto) {
    const existing = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.userId, userId),
    });

    if (existing) {
      throw new ConflictException('User already has a profile');
    }

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
        telegram: dto.telegram,
        cityId: dto.cityId,
        neighborhood: dto.neighborhood,
        address: dto.address,
        postalCode: dto.postalCode,
        latitude: dto.latitude?.toFixed(7),
        longitude: dto.longitude?.toFixed(7),
        skinColor: dto.skinColor,
        hairColor: dto.hairColor,
        eyeColor: dto.eyeColor,
        bodyType: dto.bodyType,
        ethnicity: dto.ethnicity,
        height: dto.height,
        weight: dto.weight,
        hasPlace: dto.hasPlace,
        attendsHotels: dto.attendsHotels,
        attendsHomes: dto.attendsHomes,
        priceHour: dto.priceHour.toFixed(2),
        priceNight: dto.priceNight?.toFixed(2),
        active: dto.active ?? true,
      })
      .returning();

    return profile;
  }

  async findAll() {
    const allProfiles = await this.drizzle.db.query.profiles.findMany({
      where: eq(profiles.active, true),
      orderBy: (table, { desc: d }) => [d(table.createdAt)],
    });

    const topResults = await this.drizzle.db
      .select({ profileId: subscriptions.profileId })
      .from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(and(eq(subscriptions.active, true), eq(plans.name, 'top')));

    const topIds = new Set(topResults.map((r) => r.profileId));

    return [
      ...allProfiles.filter((p) => topIds.has(p.id)),
      ...allProfiles.filter((p) => !topIds.has(p.id)),
    ];
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
        telegram: dto.telegram,
        cityId: dto.cityId,
        neighborhood: dto.neighborhood,
        address: dto.address,
        postalCode: dto.postalCode,
        latitude: dto.latitude !== undefined ? dto.latitude.toFixed(7) : undefined,
        longitude: dto.longitude !== undefined ? dto.longitude.toFixed(7) : undefined,
        skinColor: dto.skinColor,
        hairColor: dto.hairColor,
        eyeColor: dto.eyeColor,
        bodyType: dto.bodyType,
        ethnicity: dto.ethnicity,
        height: dto.height,
        weight: dto.weight,
        hasPlace: dto.hasPlace,
        attendsHotels: dto.attendsHotels,
        attendsHomes: dto.attendsHomes,
        priceHour: dto.priceHour !== undefined ? dto.priceHour.toFixed(2) : undefined,
        priceNight: dto.priceNight !== undefined ? dto.priceNight.toFixed(2) : undefined,
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

  getCategories() {
    return PROFILE_CATEGORIES;
  }
}
