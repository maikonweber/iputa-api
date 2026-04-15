import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'Email da conta para recuperacao de senha',
  })
  @IsEmail()
  email: string;
}
