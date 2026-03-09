import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';
import { cities } from './cities.schema';
import { users } from './users.schema';

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    name: text('name').notNull(),

    gender: text('gender').notNull(),

    age: integer('age'),

    description: text('description'),

    // contato
    whatsapp: text('whatsapp'),
    telegram: text('telegram'),

    // localização
    cityId: uuid('city_id')
      .notNull()
      .references(() => cities.id, { onDelete: 'restrict' }),

    neighborhood: text('neighborhood'),

    // aparência
    skinColor: text('skin_color'), // branca, negra, morena
    hairColor: text('hair_color'), // loira, ruiva, preta
    eyeColor: text('eye_color'), // azul, verde, castanho
    bodyType: text('body_type'), // magra, fitness, plus

    height: integer('height'), // cm
    weight: integer('weight'), // kg

    ethnicity: text('ethnicity'),

    // características do serviço
    hasPlace: boolean('has_place').default(false),
    attendsHotels: boolean('attends_hotels').default(true),
    attendsHomes: boolean('attends_homes').default(true),

    // valores
    priceHour: numeric('price_hour', { precision: 10, scale: 2 })
      .notNull()
      .default('0.00'),

    priceNight: numeric('price_night', { precision: 10, scale: 2 }),

    // status
    verified: boolean('verified').notNull().default(false),

    active: boolean('active').notNull().default(true),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    cityIdx: index('profiles_city_idx').on(table.cityId),

    genderIdx: index('profiles_gender_idx').on(table.gender),

    priceIdx: index('profiles_price_idx').on(table.priceHour),

    skinColorIdx: index('profiles_skin_color_idx').on(table.skinColor),

    bodyTypeIdx: index('profiles_body_type_idx').on(table.bodyType),
  }),
);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
