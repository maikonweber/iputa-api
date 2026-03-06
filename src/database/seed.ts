import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { cities, plans } from './schema';

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  await db
    .insert(cities)
    .values([
      { name: 'Sao Paulo', state: 'SP', slug: 'sao-paulo' },
      { name: 'Rio de Janeiro', state: 'RJ', slug: 'rio-de-janeiro' },
      { name: 'Belo Horizonte', state: 'MG', slug: 'belo-horizonte' },
    ])
    .onConflictDoNothing({ target: cities.slug });

  await db
    .insert(plans)
    .values([
      { name: 'free', price: '0.00', durationDays: 30, highlight: false },
      { name: 'premium', price: '49.90', durationDays: 30, highlight: true },
      { name: 'top', price: '89.90', durationDays: 30, highlight: true },
    ])
    .onConflictDoNothing({ target: plans.name });

  await pool.end();
  // eslint-disable-next-line no-console
  console.log('Seed completed.');
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exit(1);
});
