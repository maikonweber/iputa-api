import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { users } from '../../database/schema';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private readonly drizzle: DrizzleService) {}

  async me(userId: string) {
    const user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      created_at: user.createdAt,
    };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const [user] = await this.drizzle.db
      .update(users)
      .set({
        email: dto.email,
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        created_at: users.createdAt,
      });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
