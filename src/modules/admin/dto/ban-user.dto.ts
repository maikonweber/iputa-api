import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class BanUserDto {
  @ApiPropertyOptional({ description: 'Motivo do banimento' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
