import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  state: text('state').notNull(),
  slug: text('slug').notNull().unique(),
});

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
