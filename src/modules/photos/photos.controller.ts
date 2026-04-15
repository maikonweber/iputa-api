import {
  Controller,
  Delete,
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
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
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
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({ description: 'Foto enviada com sucesso' })
  @ApiNotFoundResponse({ description: 'Perfil nao encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  upload(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) profileId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filePath = `/uploads/${file.filename}`;
    return this.photosService.upload(user.id, profileId, filePath);
  }

  @Delete('photos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Foto removida com sucesso' })
  @ApiNotFoundResponse({ description: 'Foto nao encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.remove(user.id, photoId);
  }
}
