import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FaceVerificationService } from './face-verification.service';

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function assertImageMime(mimetype: string | undefined) {
  if (!mimetype || !ALLOWED_MIMES.has(mimetype)) {
    throw new BadRequestException(
      'Formato invalido. Use JPEG, PNG ou WebP.',
    );
  }
}

@ApiTags('face-verification')
@Controller('face-verification')
export class FaceVerificationController {
  constructor(private readonly faceVerification: FaceVerificationService) {}

  @Post('analyze')
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
  @ApiQuery({
    name: 'minAge',
    required: false,
    description: 'Idade minima exigida (padrao 18)',
    example: 18,
  })
  @ApiOkResponse({
    description: 'Analise concluida (uma foto, um rosto)',
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 6 * 1024 * 1024 },
    }),
  )
  analyze(
    @UploadedFile() file: Express.Multer.File,
    @Query('minAge') minAgeRaw?: string,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Arquivo ausente');
    }
    assertImageMime(file.mimetype);

    const minimumAge = minAgeRaw === undefined ? 18 : Number(minAgeRaw);
    if (!Number.isFinite(minimumAge) || minimumAge < 1 || minimumAge > 120) {
      throw new BadRequestException('minAge invalido');
    }

    return this.faceVerification.analyzeFaceAge(
      file.buffer,
      file.mimetype,
      minimumAge,
    );
  }
}
