import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PhotosService } from './photos.service';

@ApiTags('photos')
@Controller()
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('profiles/:id/photos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
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
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) profileId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filePath = `/uploads/${file.filename}`;
    return this.photosService.upload(user.id, profileId, filePath);
  }

  @Delete('photos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @CurrentUser() user: { id: number },
    @Param('id', ParseIntPipe) photoId: number,
  ) {
    return this.photosService.remove(user.id, photoId);
  }
}
