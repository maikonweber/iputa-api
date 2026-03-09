import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({
    description: 'Usuario registrado com sucesso',
  })
  @ApiBadRequestResponse({
    description: 'Dados invalidos ou email ja cadastrado',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOkResponse({
    description: 'Autenticacao realizada com sucesso',
  })
  @ApiBadRequestResponse({
    description: 'Dados invalidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais invalidas',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
