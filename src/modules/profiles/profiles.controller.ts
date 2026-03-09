import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Perfil criado com sucesso' })
  @ApiBadRequestResponse({ description: 'Payload invalido para criacao' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateProfileDto,
  ) {
    return this.profilesService.create(user.id, dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista de perfis retornada com sucesso' })
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Perfil encontrado com sucesso' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.profilesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Perfil atualizado com sucesso' })
  @ApiBadRequestResponse({ description: 'Payload invalido para atualizacao' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profilesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Perfil removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.profilesService.remove(user.id, id);
  }
}
