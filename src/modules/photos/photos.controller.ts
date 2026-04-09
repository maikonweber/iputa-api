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
import { PhotosService } from './photos.service';

@ApiTags('photos')
@Controller()
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('profiles/:id/photos')
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
  @ApiCreatedResponse({ description: 'Foto enviada com sucesso' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @Auth.CurrentUser() user: Auth.AuthUser,
    @Param('id', ParseUUIDPipe) profileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.photosService.upload(user.id, profileId, file);
  }

  @Get('profiles/:id/photos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Fotos do perfil com URLs assinadas' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  findByProfile(@Param('id', ParseUUIDPipe) profileId: string) {
    return this.photosService.findByProfile(profileId);
  }

  @Get('photos/:id/signed-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'URL assinada da foto (expira em 1h)' })
  @ApiNotFoundResponse({ description: 'Foto nao encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  getSignedUrl(
    @Auth.CurrentUser() user: Auth.AuthUser,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.getSignedUrl(user.id, photoId);
  }

  @Delete('photos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Foto removida com sucesso' })
  @ApiNotFoundResponse({ description: 'Foto nao encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  remove(
    @Auth.CurrentUser() user: Auth.AuthUser,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.remove(user.id, photoId);
  }
}
