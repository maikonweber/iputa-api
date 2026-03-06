import { index, integer, numeric, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { cities } from './cities.schema';
import { users } from './users.schema';

export const profiles = pgTable(
  'profiles',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    gender: text('gender').notNull(),
    age: integer('age'),
    description: text('description'),
    whatsapp: text('whatsapp'),
    cityId: integer('city_id')
      .notNull()
      .references(() => cities.id, { onDelete: 'restrict' }),
    neighborhood: text('neighborhood'),
    priceHour: numeric('price_hour', { precision: 10, scale: 2 }).notNull().default('0.00'),
    verified: boolean('verified').notNull().default(false),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    cityIdx: index('profiles_city_idx').on(table.cityId),
    genderIdx: index('profiles_gender_idx').on(table.gender),
    priceIdx: index('profiles_price_idx').on(table.priceHour),
  }),
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
