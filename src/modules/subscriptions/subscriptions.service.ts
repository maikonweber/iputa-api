import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { plans, profiles, subscriptions } from '../../database/schema';
import { StripeService } from '../stripe/stripe.service';

const FREE_PLAN_LIMITS = { maxPhotos: 5, maxVideos: 1, maxStories: 0 } as const;

export type PlanLimits = {
  maxPhotos: number | null;
  maxVideos: number | null;
  maxStories: number | null;
};

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly stripeService: StripeService,
  ) {}

  private subscriptionSelectFields = {
    id: subscriptions.id,
    profile_id: subscriptions.profileId,
    plan_id: subscriptions.planId,
    plan_name: plans.name,
    start_date: subscriptions.startDate,
    end_date: subscriptions.endDate,
    active: subscriptions.active,
    stripe_subscription_id: subscriptions.stripeSubscriptionId,
  } as const;

  private async profileIdsForUser(userId: string): Promise<string[]> {
    const myProfiles = await this.drizzle.db.query.profiles.findMany({
      where: eq(profiles.userId, userId),
      columns: { id: true },
    });
    return myProfiles.map((p) => p.id);
  }

  async mine(userId: string) {
    const profileIds = await this.profileIdsForUser(userId);
    if (profileIds.length === 0) {
      return [];
    }

    return this.drizzle.db
      .select(this.subscriptionSelectFields)
      .from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(
        and(
          inArray(subscriptions.profileId, profileIds),
          eq(subscriptions.active, true),
        ),
      );
  }

  async history(userId: string) {
    const profileIds = await this.profileIdsForUser(userId);
    if (profileIds.length === 0) {
      return [];
    }

    return this.drizzle.db
      .select(this.subscriptionSelectFields)
      .from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(inArray(subscriptions.profileId, profileIds))
      .orderBy(desc(subscriptions.startDate));
  }

  async cancelForUser(userId: string, subscriptionId: string) {
    const [row] = await this.drizzle.db
      .select({
        subscription: subscriptions,
        profileUserId: profiles.userId,
      })
      .from(subscriptions)
      .innerJoin(profiles, eq(profiles.id, subscriptions.profileId))
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('Subscription not found');
    }

    if (row.profileUserId !== userId) {
      throw new ForbiddenException('You cannot cancel this subscription');
    }

    if (!row.subscription.active) {
      throw new BadRequestException('Subscription is already inactive');
    }

    if (row.subscription.stripeSubscriptionId) {
      await this.stripeService.cancelSubscriptionAtPeriodEnd(
        row.subscription.stripeSubscriptionId,
      );
    } else {
      await this.drizzle.db
        .update(subscriptions)
        .set({ active: false })
        .where(eq(subscriptions.id, subscriptionId));
    }

    return { canceled: true };
  }

  /**
   * Replaces any active subscription on the profile with a local (non-Stripe) grant.
   * Cancels existing Stripe subscriptions when present.
   */
  async grantByAdmin(profileId: string, planId: string, expectedUserId?: string) {
    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (expectedUserId && profile.userId !== expectedUserId) {
      throw new BadRequestException('Profile does not belong to this user');
    }

    const plan = await this.drizzle.db.query.plans.findFirst({
      where: eq(plans.id, planId),
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (plan.name === 'free') {
      throw new BadRequestException('Cannot grant the free plan as a subscription');
    }

    const existingActives = await this.drizzle.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.profileId, profileId), eq(subscriptions.active, true)));

    for (const sub of existingActives) {
      if (sub.stripeSubscriptionId) {
        try {
          await this.stripeService.cancelStripeSubscriptionImmediately(
            sub.stripeSubscriptionId,
          );
        } catch {
          // Stripe may already have canceled; continue clearing local state
        }
      }
    }

    if (existingActives.length > 0) {
      await this.drizzle.db
        .update(subscriptions)
        .set({ active: false })
        .where(and(eq(subscriptions.profileId, profileId), eq(subscriptions.active, true)));
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + plan.durationDays);

    const [created] = await this.drizzle.db
      .insert(subscriptions)
      .values({
        profileId,
        planId,
        startDate: now,
        endDate,
        active: true,
        stripeSubscriptionId: null,
      })
      .returning();

    return created;
  }

  async getActivePlanLimits(profileId: string): Promise<PlanLimits> {
    const result = await this.drizzle.db
      .select({
        maxPhotos: plans.maxPhotos,
        maxVideos: plans.maxVideos,
        maxStories: plans.maxStories,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(
        and(
          eq(subscriptions.profileId, profileId),
          eq(subscriptions.active, true),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return { ...FREE_PLAN_LIMITS };
    }

    return result[0];
  }
}
