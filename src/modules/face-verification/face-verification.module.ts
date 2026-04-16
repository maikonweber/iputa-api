import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FaceVerificationController } from './face-verification.controller';
import { FaceVerificationService } from './face-verification.service';

@Module({
  imports: [AuthModule],
  controllers: [FaceVerificationController],
  providers: [FaceVerificationService],
})
export class FaceVerificationModule {}
