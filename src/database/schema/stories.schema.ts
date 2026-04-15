import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profiles } from './profiles.schema';

export const stories = pgTable(
  'stories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    mediaUrl: text('media_url').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    profileIdx: index('stories_profile_idx').on(table.profileId),
    expiresIdx: index('stories_expires_idx').on(table.expiresAt),
  }),
);

export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
