import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({
    example: 'novo@email.com',
    description: 'Novo email do usuario',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
