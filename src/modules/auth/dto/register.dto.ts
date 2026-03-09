import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email do usuario para cadastro',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    minLength: 6,
    description: 'Senha de acesso com no minimo 6 caracteres',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
