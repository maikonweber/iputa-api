import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Assinatura criada com sucesso' })
  @ApiBadRequestResponse({ description: 'Payload invalido para assinatura' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(user.id, dto);
  }

  @Get('me')
  @ApiOkResponse({ description: 'Assinaturas do usuario autenticado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  mine(@CurrentUser() user: AuthUser) {
    return this.subscriptionsService.mine(user.id);
  }
}
