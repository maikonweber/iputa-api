import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { plans } from './plans.schema';
import { profiles } from './profiles.schema';

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id, { onDelete: 'restrict' }),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    active: boolean('active').notNull().default(true),
    stripeSubscriptionId: text('stripe_subscription_id'),
  },
  (table) => ({
    profileIdx: index('subscriptions_profile_idx').on(table.profileId),
    activeIdx: index('subscriptions_active_idx').on(table.active),
  }),
);

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
