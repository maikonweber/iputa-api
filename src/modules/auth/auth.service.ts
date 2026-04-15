import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { DrizzleService } from '../../database/drizzle.service';
import { users } from '../../database/schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailQueueService } from '../queues/email/email-queue.service';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly jwtService: JwtService,
    private readonly emailQueue: EmailQueueService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [user] = await this.drizzle.db
      .insert(users)
      .values({
        email: dto.email,
        password: passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
      });

    await this.emailQueue.addWelcomeEmail(user.email);

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, dto.email),
    });

    if (!user) {
      return { message: 'Se o email existir, um link de recuperacao sera enviado' };
    }

    const resetToken = randomUUID();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.drizzle.db
      .update(users)
      .set({ resetToken, resetTokenExpiresAt: expiresAt })
      .where(eq(users.id, user.id));

    await this.emailQueue.addForgotPasswordEmail(user.email, resetToken);

    return { message: 'Se o email existir, um link de recuperacao sera enviado' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.resetToken, dto.token),
    });

    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      throw new BadRequestException('Token invalido ou expirado');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.drizzle.db
      .update(users)
      .set({
        password: passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
      })
      .where(eq(users.id, user.id));

    return { message: 'Senha redefinida com sucesso' };
  }
}
