import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as Auth from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';

@ApiTags('users')
// @ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Dados do usuario autenticado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  me(@Auth.CurrentUser() user: Auth.AuthUser) {
    return this.usersService.me(user.id);
  }

  @Patch('me')
  @ApiOkResponse({ description: 'Dados do usuario atualizados com sucesso' })
  @ApiBadRequestResponse({ description: 'Payload invalido para atualizacao' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  updateMe(@Auth.CurrentUser() user: Auth.AuthUser, @Body() dto: UpdateMeDto) {
    return this.usersService.updateMe(user.id, dto);
  }
}
