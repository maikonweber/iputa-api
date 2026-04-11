import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de recuperacao recebido por email',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'novaSenha123',
    minLength: 6,
    description: 'Nova senha com no minimo 6 caracteres',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
