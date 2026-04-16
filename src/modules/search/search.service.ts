import { Injectable } from '@nestjs/common';
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  lte,
  or,
  sql,
  SQL,
} from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { cities, profiles } from '../../database/schema';
import { SearchQueryDto } from './dto/search-query.dto';

function escapeIlikePattern(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

@Injectable()
export class SearchService {
  constructor(private readonly drizzle: DrizzleService) {}

  async search(query: SearchQueryDto) {
    const filters: SQL[] = [eq(profiles.active, true)];

    if (query.city) {
      filters.push(sql`lower(${cities.slug}) = lower(${query.city})`);
    }

    if (query.gender) {
      filters.push(sql`lower(${profiles.gender}) = lower(${query.gender})`);
    }

    if (query.q) {
      const term = `%${escapeIlikePattern(query.q)}%`;
      filters.push(
        or(
          sql`${profiles.name} ILIKE ${term} ESCAPE '\\'`,
          sql`coalesce(${profiles.description}, '') ILIKE ${term} ESCAPE '\\'`,
        )!,
      );
    }

    if (query.price_min !== undefined) {
      filters.push(gte(profiles.priceHour, query.price_min.toFixed(2)));
    }

    if (query.price_max !== undefined) {
      filters.push(lte(profiles.priceHour, query.price_max.toFixed(2)));
    }

    if (query.price_night_min !== undefined) {
      filters.push(gte(profiles.priceNight, query.price_night_min.toFixed(2)));
    }

    if (query.price_night_max !== undefined) {
      filters.push(lte(profiles.priceNight, query.price_night_max.toFixed(2)));
    }

    if (query.has_place !== undefined) {
      filters.push(eq(profiles.hasPlace, query.has_place));
    }

    if (query.attends_hotels !== undefined) {
      filters.push(eq(profiles.attendsHotels, query.attends_hotels));
    }

    if (query.attends_homes !== undefined) {
      filters.push(eq(profiles.attendsHomes, query.attends_homes));
    }

    if (query.verified !== undefined) {
      filters.push(eq(profiles.verified, query.verified));
    }

    if (query.eye_color?.length) {
      filters.push(inArray(profiles.eyeColor, query.eye_color));
    }

    if (query.hair_color?.length) {
      filters.push(inArray(profiles.hairColor, query.hair_color));
    }

    if (query.skin_color?.length) {
      filters.push(inArray(profiles.skinColor, query.skin_color));
    }

    if (query.body_type?.length) {
      filters.push(inArray(profiles.bodyType, query.body_type));
    }

    if (query.ethnicity?.length) {
      filters.push(inArray(profiles.ethnicity, query.ethnicity));
    }

    if (query.age_min !== undefined) {
      filters.push(gte(profiles.age, query.age_min));
    }

    if (query.age_max !== undefined) {
      filters.push(lte(profiles.age, query.age_max));
    }

    if (query.height_min !== undefined) {
      filters.push(gte(profiles.height, query.height_min));
    }

    if (query.height_max !== undefined) {
      filters.push(lte(profiles.height, query.height_max));
    }

    if (query.weight_min !== undefined) {
      filters.push(gte(profiles.weight, query.weight_min));
    }

    if (query.weight_max !== undefined) {
      filters.push(lte(profiles.weight, query.weight_max));
    }

    const sort = query.sort ?? 'created_desc';
    const orderByClause = {
      created_desc: desc(profiles.createdAt),
      created_asc: asc(profiles.createdAt),
      price_hour_asc: asc(profiles.priceHour),
      price_hour_desc: desc(profiles.priceHour),
      price_night_asc: asc(profiles.priceNight),
      price_night_desc: desc(profiles.priceNight),
    }[sort];

    const limit = query.limit ?? 30;
    const offset = query.offset ?? 0;

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
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);
  }
}
