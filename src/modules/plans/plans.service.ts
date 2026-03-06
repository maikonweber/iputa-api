import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../database/drizzle.service';

@Injectable()
export class PlansService {
  constructor(private readonly drizzle: DrizzleService) {}

  findAll() {
    return this.drizzle.db.query.plans.findMany({
      orderBy: (table, { asc }) => [asc(table.price)],
    });
  }
}
