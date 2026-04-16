import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as Auth from '../auth/current-user.decorator';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  @ApiOkResponse({ description: 'Assinaturas ativas do usuario autenticado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  mine(@Auth.CurrentUser() user: Auth.AuthUser) {
    return this.subscriptionsService.mine(user.id);
  }

  @Get('history')
  @ApiOkResponse({ description: 'Historico de assinaturas dos perfis do usuario' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  history(@Auth.CurrentUser() user: Auth.AuthUser) {
    return this.subscriptionsService.history(user.id);
  }

  @Post('cancel')
  @ApiOkResponse({ description: 'Cancelamento solicitado (Stripe: fim do periodo; local: inativo)' })
  @ApiBadRequestResponse({ description: 'Assinatura ja inativa ou invalida' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  cancel(
    @Auth.CurrentUser() user: Auth.AuthUser,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancelForUser(user.id, dto.subscription_id);
  }
}
