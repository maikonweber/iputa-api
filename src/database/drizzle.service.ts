import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  public readonly db: NodePgDatabase<typeof schema>;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const poolMax = Number(process.env.DB_POOL_MAX ?? 10);
    const idleTimeoutMillis = Number(process.env.DB_POOL_IDLE_MS ?? 30_000);
    const connectionTimeoutMillis = Number(
      process.env.DB_POOL_CONNECTION_TIMEOUT_MS ?? 2_000,
    );

    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    this.pool = new Pool({
      connectionString,
      max: Number.isFinite(poolMax) ? poolMax : 10,
      idleTimeoutMillis: Number.isFinite(idleTimeoutMillis)
        ? idleTimeoutMillis
        : 30_000,
      connectionTimeoutMillis: Number.isFinite(connectionTimeoutMillis)
        ? connectionTimeoutMillis
        : 2_000,
      application_name: process.env.DB_APPLICATION_NAME ?? 'iputa-api',
    });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
