import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  cities,
  photos,
  plans,
  profiles,
  reviews,
  subscriptions,
  users,
} from './schema';

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_MS ?? 30_000),
    connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECTION_TIMEOUT_MS ?? 2_000),
    application_name: process.env.DB_APPLICATION_NAME ?? 'iputa-seed',
  });
  const db = drizzle(pool);

  await db.execute(
    sql`TRUNCATE TABLE reviews, subscriptions, photos, profiles, users, plans, cities RESTART IDENTITY CASCADE`,
  );

  const insertedCities = await db
    .insert(cities)
    .values([
      { name: 'Sao Paulo', state: 'SP', slug: 'sao-paulo' },
      { name: 'Rio de Janeiro', state: 'RJ', slug: 'rio-de-janeiro' },
      { name: 'Belo Horizonte', state: 'MG', slug: 'belo-horizonte' },
      { name: 'Curitiba', state: 'PR', slug: 'curitiba' },
      { name: 'Florianopolis', state: 'SC', slug: 'florianopolis' },
    ])
    .returning({ id: cities.id, slug: cities.slug });

  const stripePremium = process.env.STRIPE_PRICE_PREMIUM?.trim() || null;
  const stripeTop = process.env.STRIPE_PRICE_TOP?.trim() || null;

  const insertedPlans = await db
    .insert(plans)
    .values([
      { name: 'free', price: '0.00', durationDays: 30, highlight: false, maxPhotos: 5, maxVideos: 1, maxStories: 0 },
      {
        name: 'premium',
        price: '49.90',
        durationDays: 30,
        highlight: true,
        maxPhotos: 20,
        maxVideos: 10,
        maxStories: 2,
        stripePriceId: stripePremium,
      },
      {
        name: 'top',
        price: '89.90',
        durationDays: 30,
        highlight: true,
        maxPhotos: null,
        maxVideos: null,
        maxStories: null,
        stripePriceId: stripeTop,
      },
    ])
    .returning({ id: plans.id, name: plans.name });

  const passwordHash = await bcrypt.hash('123456', 10);
  const insertedUsers = await db
    .insert(users)
    .values([
      { email: 'alice@iputa.dev', password: passwordHash },
      { email: 'bruna@iputa.dev', password: passwordHash },
      { email: 'carla@iputa.dev', password: passwordHash },
      { email: 'diego@iputa.dev', password: passwordHash },
      { email: 'erika@iputa.dev', password: passwordHash },
    ])
    .returning({ id: users.id, email: users.email });

  const cityBySlug = new Map(insertedCities.map((city) => [city.slug, city.id]));
  const profilesSeed = [
    {
      userId: insertedUsers[0].id,
      name: 'Alice Lux',
      gender: 'feminino',
      age: 24,
      description: 'Atendimento premium na regiao central',
      whatsapp: '11999990001',
      cityId: cityBySlug.get('sao-paulo')!,
      neighborhood: 'Centro',
      skinColor: 'morena',
      hairColor: 'preta',
      eyeColor: 'castanho',
      bodyType: 'fitness',
      height: 168,
      weight: 58,
      ethnicity: 'latina',
      hasPlace: true,
      attendsHotels: true,
      attendsHomes: true,
      priceHour: '350.00',
      priceNight: '1800.00',
      active: true,
      verified: true,
    },
    {
      userId: insertedUsers[1].id,
      name: 'Bruna Gold',
      gender: 'feminino',
      age: 27,
      description: 'Discreta e elegante para eventos',
      whatsapp: '21999990002',
      cityId: cityBySlug.get('rio-de-janeiro')!,
      neighborhood: 'Copacabana',
      skinColor: 'branca',
      hairColor: 'loira',
      eyeColor: 'verde',
      bodyType: 'magra',
      height: 170,
      weight: 55,
      ethnicity: 'brasileira',
      hasPlace: false,
      attendsHotels: true,
      attendsHomes: false,
      priceHour: '420.00',
      priceNight: '2100.00',
      active: true,
      verified: true,
    },
    {
      userId: insertedUsers[2].id,
      name: 'Carla Prime',
      gender: 'feminino',
      age: 29,
      description: 'Atendimento completo com local proprio',
      whatsapp: '31999990003',
      cityId: cityBySlug.get('belo-horizonte')!,
      neighborhood: 'Savassi',
      skinColor: 'negra',
      hairColor: 'preta',
      eyeColor: 'castanho',
      bodyType: 'plus',
      height: 172,
      weight: 67,
      ethnicity: 'afro',
      hasPlace: true,
      attendsHotels: true,
      attendsHomes: true,
      priceHour: '300.00',
      priceNight: '1500.00',
      active: true,
      verified: false,
    },
  ];

  const insertedProfiles = await db
    .insert(profiles)
    .values(profilesSeed)
    .returning({ id: profiles.id, userId: profiles.userId });

  await db.insert(photos).values([
    {
      profileId: insertedProfiles[0].id,
      url: `photos/${insertedProfiles[0].id}/alice-1.jpg`,
      isPrimary: true,
    },
    {
      profileId: insertedProfiles[0].id,
      url: `photos/${insertedProfiles[0].id}/alice-2.jpg`,
      isPrimary: false,
    },
    {
      profileId: insertedProfiles[1].id,
      url: `photos/${insertedProfiles[1].id}/bruna-1.jpg`,
      isPrimary: true,
    },
    {
      profileId: insertedProfiles[2].id,
      url: `photos/${insertedProfiles[2].id}/carla-1.jpg`,
      isPrimary: true,
    },
  ]);

  const planByName = new Map(insertedPlans.map((plan) => [plan.name, plan.id]));
  const today = new Date();
  const inThirtyDays = new Date(today);
  inThirtyDays.setDate(today.getDate() + 30);

  await db.insert(subscriptions).values([
    {
      profileId: insertedProfiles[0].id,
      planId: planByName.get('premium')!,
      startDate: today,
      endDate: inThirtyDays,
      active: true,
    },
    {
      profileId: insertedProfiles[1].id,
      planId: planByName.get('top')!,
      startDate: today,
      endDate: inThirtyDays,
      active: true,
    },
  ]);

  await db.insert(reviews).values([
    {
      profileId: insertedProfiles[0].id,
      userId: insertedUsers[3].id,
      rating: 5,
      comment: 'Excelente atendimento, muito profissional.',
    },
    {
      profileId: insertedProfiles[1].id,
      userId: insertedUsers[4].id,
      rating: 4,
      comment: 'Boa experiencia, voltarei a contratar.',
    },
  ]);

  await pool.end();
  // eslint-disable-next-line no-console
  console.log('Seed completed with fake data.');
  // eslint-disable-next-line no-console
  console.log('Login users (password 123456):');
  // eslint-disable-next-line no-console
  console.table(insertedUsers.map((item) => ({ email: item.email })));
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exit(1);
});
