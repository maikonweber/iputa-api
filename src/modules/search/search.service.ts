import { Injectable } from '@nestjs/common';
import { and, eq, gte, lte, SQL } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { cities, profiles } from '../../database/schema';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly drizzle: DrizzleService) {}

  async search(query: SearchQueryDto) {
    const filters: SQL[] = [eq(profiles.active, true)];

    if (query.city) {
      filters.push(eq(cities.slug, query.city));
    }

    if (query.gender) {
      filters.push(eq(profiles.gender, query.gender));
    }

    if (query.price_min !== undefined) {
      filters.push(gte(profiles.priceHour, query.price_min.toFixed(2)));
    }

    if (query.price_max !== undefined) {
      filters.push(lte(profiles.priceHour, query.price_max.toFixed(2)));
    }

    return this.drizzle.db
      .select({
        id: profiles.id,
        name: profiles.name,
        gender: profiles.gender,
        city: cities.name,
        state: cities.state,
        city_slug: cities.slug,
        price_hour: profiles.priceHour,
        verified: profiles.verified,
      })
      .from(profiles)
      .innerJoin(cities, eq(cities.id, profiles.cityId))
      .where(and(...filters))
      .orderBy(profiles.createdAt);
  }
}
