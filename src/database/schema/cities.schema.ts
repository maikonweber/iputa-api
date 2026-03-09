import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const cities = pgTable('cities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  state: text('state').notNull(),
  slug: text('slug').notNull().unique(),
});

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
