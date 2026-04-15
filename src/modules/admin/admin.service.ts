import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNotNull,
  isNull,
  type SQL,
} from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { profiles, users } from '../../database/schema';
import { ADMIN_ROLE } from '../auth/auth.constants';
import { AdminProfilesQueryDto } from './dto/admin-profiles-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';

@Injectable()
export class AdminService {
  constructor(private readonly drizzle: DrizzleService) {}

  async listUsers(query: AdminUsersQueryDto) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const filters: SQL[] = [];
    if (query.q?.trim()) {
      filters.push(ilike(users.email, `%${query.q.trim()}%`));
    }
    if (query.banned === 'true') {
      filters.push(isNotNull(users.bannedAt));
    }
    if (query.banned === 'false') {
      filters.push(isNull(users.bannedAt));
    }
    const whereClause = filters.length ? and(...filters) : undefined;

    const listBase = this.drizzle.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        bannedAt: users.bannedAt,
        bannedReason: users.bannedReason,
        createdAt: users.createdAt,
      })
      .from(users);
    const countBase = this.drizzle.db
      .select({ total: count() })
      .from(users);

    const [items, totalRow] = await Promise.all([
      (whereClause ? listBase.where(whereClause) : listBase)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      whereClause ? countBase.where(whereClause) : countBase,
    ]);

    return {
      items,
      total: Number(totalRow[0]?.total ?? 0),
      limit,
      offset,
    };
  }

  async getUserById(id: string) {
    const [user] = await this.drizzle.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        bannedAt: users.bannedAt,
        bannedReason: users.bannedReason,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userProfiles = await this.drizzle.db.query.profiles.findMany({
      where: eq(profiles.userId, id),
      orderBy: (t, { desc: d }) => [d(t.createdAt)],
    });

    return { user, profiles: userProfiles };
  }

  async banUser(actorId: string, targetId: string, reason?: string) {
    if (actorId === targetId) {
      throw new BadRequestException('Cannot ban yourself');
    }

    const [target] = await this.drizzle.db
      .select({
        id: users.id,
        role: users.role,
        bannedAt: users.bannedAt,
      })
      .from(users)
      .where(eq(users.id, targetId))
      .limit(1);

    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (target.role === ADMIN_ROLE) {
      throw new BadRequestException('Cannot ban an administrator');
    }
    if (target.bannedAt) {
      throw new BadRequestException('User is already banned');
    }

    const [updated] = await this.drizzle.db
      .update(users)
      .set({
        bannedAt: new Date(),
        bannedReason: reason ?? null,
      })
      .where(eq(users.id, targetId))
      .returning({
        id: users.id,
        email: users.email,
        bannedAt: users.bannedAt,
        bannedReason: users.bannedReason,
      });

    return updated;
  }

  async unbanUser(targetId: string) {
    const [target] = await this.drizzle.db
      .select({ id: users.id, bannedAt: users.bannedAt })
      .from(users)
      .where(eq(users.id, targetId))
      .limit(1);

    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (!target.bannedAt) {
      throw new BadRequestException('User is not banned');
    }

    const [updated] = await this.drizzle.db
      .update(users)
      .set({
        bannedAt: null,
        bannedReason: null,
      })
      .where(eq(users.id, targetId))
      .returning({
        id: users.id,
        email: users.email,
        bannedAt: users.bannedAt,
        bannedReason: users.bannedReason,
      });

    return updated;
  }

  async listProfiles(query: AdminProfilesQueryDto) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const filters: SQL[] = [];
    if (query.q?.trim()) {
      filters.push(ilike(profiles.name, `%${query.q.trim()}%`));
    }
    if (query.active === 'true') {
      filters.push(eq(profiles.active, true));
    }
    if (query.active === 'false') {
      filters.push(eq(profiles.active, false));
    }
    const whereClause = filters.length ? and(...filters) : undefined;

    const countBase = this.drizzle.db
      .select({ total: count() })
      .from(profiles);

    const [items, totalRow] = await Promise.all([
      whereClause
        ? this.drizzle.db.query.profiles.findMany({
            where: whereClause,
            orderBy: (t, { desc: d }) => [d(t.createdAt)],
            limit,
            offset,
          })
        : this.drizzle.db.query.profiles.findMany({
            orderBy: (t, { desc: d }) => [d(t.createdAt)],
            limit,
            offset,
          }),
      whereClause ? countBase.where(whereClause) : countBase,
    ]);

    return {
      items,
      total: Number(totalRow[0]?.total ?? 0),
      limit,
      offset,
    };
  }

  async getProfileById(id: string) {
    const profile = await this.drizzle.db.query.profiles.findFirst({
      where: eq(profiles.id, id),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }
}
