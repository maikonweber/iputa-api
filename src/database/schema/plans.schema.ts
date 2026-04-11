import { boolean, integer, numeric, pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  durationDays: integer('duration_days').notNull(),
  highlight: boolean('highlight').notNull().default(false),
  maxPhotos: integer('max_photos'),
  maxVideos: integer('max_videos'),
  maxStories: integer('max_stories'),
  stripePriceId: text('stripe_price_id'),
});

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
