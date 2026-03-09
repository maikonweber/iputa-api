import { Injectable } from '@nestjs/common';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { plans, profiles, subscriptions } from '../../database/schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(userId: string, dto: CreateSubscriptionDto) {
    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, dto.profile_id),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('You cannot subscribe this profile');
    }

    const plan = await this.drizzle.db.query.plans.findFirst({
      where: eq(plans.id, dto.plan_id),
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const [subscription] = await this.drizzle.db
      .insert(subscriptions)
      .values({
        profileId: dto.profile_id,
        planId: dto.plan_id,
        startDate: new Date(dto.start_date),
        endDate: new Date(dto.end_date),
        active: true,
      })
      .returning();

    return subscription;
  }

  async mine(userId: string) {
    const myProfiles = await this.drizzle.db.query.profiles.findMany({
      where: eq(profiles.userId, userId),
      columns: { id: true },
    });

    if (myProfiles.length === 0) {
      return [];
    }

    const profileIds = myProfiles.map((item) => item.id);

    return this.drizzle.db
      .select({
        id: subscriptions.id,
        profile_id: subscriptions.profileId,
        plan_id: subscriptions.planId,
        start_date: subscriptions.startDate,
        end_date: subscriptions.endDate,
        active: subscriptions.active,
      })
      .from(subscriptions)
      .where(
        and(
          inArray(subscriptions.profileId, profileIds),
          eq(subscriptions.active, true),
        ),
      );
  }
}
