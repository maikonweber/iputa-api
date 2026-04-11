import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as Auth from '../auth/current-user.decorator';
import { StoriesService } from './stories.service';

@ApiTags('stories')
@Controller()
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Post('profiles/:id/stories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({ description: 'Story criado com sucesso (expira em 24h)' })
  @ApiForbiddenResponse({ description: 'Limite de stories atingido para o plano' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  create(
    @Auth.CurrentUser() user: Auth.AuthUser,
    @Param('id', ParseUUIDPipe) profileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.storiesService.create(user.id, profileId, file);
  }

  @Get('profiles/:id/stories')
  @ApiOkResponse({ description: 'Stories ativos do perfil (nao expirados)' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  findActive(@Param('id', ParseUUIDPipe) profileId: string) {
    return this.storiesService.findActiveByProfile(profileId);
  }

  @Delete('stories/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Story removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Story nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  remove(
    @Auth.CurrentUser() user: Auth.AuthUser,
    @Param('id', ParseUUIDPipe) storyId: string,
  ) {
    return this.storiesService.remove(user.id, storyId);
  }
}
