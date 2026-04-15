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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as Auth from '../auth/current-user.decorator';
import { VideosService } from './videos.service';

@ApiTags('videos')
@Controller()
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('profiles/:id/videos')
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
  @ApiCreatedResponse({ description: 'Video enviado com sucesso' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @Auth.CurrentUser() user: Auth.AuthUser,
    @Param('id', ParseUUIDPipe) profileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videosService.upload(user.id, profileId, file);
  }

  @Get('profiles/:id/videos')
  @ApiOkResponse({ description: 'Videos do perfil com URLs assinadas' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  findByProfile(@Param('id', ParseUUIDPipe) profileId: string) {
    return this.videosService.findByProfile(profileId);
  }

  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Video removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Video nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  remove(
    @Auth.CurrentUser() user: Auth.AuthUser,
    @Param('id', ParseUUIDPipe) videoId: string,
  ) {
    return this.videosService.remove(user.id, videoId);
  }
}
