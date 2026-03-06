import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { cities } from '../../database/schema';

@Injectable()
export class CitiesService {
  constructor(private readonly drizzle: DrizzleService) {}

  findAll() {
    return this.drizzle.db.query.cities.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
    });
  }

  async findBySlug(slug: string) {
    const city = await this.drizzle.db.query.cities.findFirst({
      where: eq(cities.slug, slug),
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    return city;
  }
}
