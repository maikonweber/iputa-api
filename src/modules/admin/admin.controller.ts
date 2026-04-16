import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { AdminProfilesQueryDto } from './dto/admin-profiles-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { BanUserDto } from './dto/ban-user.dto';
@ApiTags('admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
@ApiForbiddenResponse({ description: 'Conta suspensa ou sem permissao de admin' })
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOkResponse({ description: 'Lista paginada de usuarios' })
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @ApiOkResponse({ description: 'Usuario e perfis associados' })
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users/:id/ban')
  @ApiOkResponse({ description: 'Usuario banido' })
  banUser(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BanUserDto,
  ) {
    return this.adminService.banUser(actor.id, id, dto.reason);
  }

  @Post('users/:id/unban')
  @ApiOkResponse({ description: 'Usuario desbloqueado' })
  unbanUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get('profiles')
  @ApiOkResponse({ description: 'Lista paginada de perfis' })
  listProfiles(@Query() query: AdminProfilesQueryDto) {
    return this.adminService.listProfiles(query);
  }

  @Get('profiles/:id')
  @ApiOkResponse({ description: 'Detalhe do perfil' })
  getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getProfileById(id);
  }
}
