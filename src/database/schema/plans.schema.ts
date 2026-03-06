import { boolean, integer, numeric, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const plans = pgTable('plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  durationDays: integer('duration_days').notNull(),
  highlight: boolean('highlight').notNull().default(false),
});

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
