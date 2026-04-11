import {
  Body,
  Controller,
  Headers,
  Post,
  RawBody,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as Auth from '../auth/current-user.decorator';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Sessao de checkout criada' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
  createCheckout(
    @Auth.CurrentUser() user: Auth.AuthUser,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.stripeService.createCheckoutSession(user.id, dto.profileId, dto.planId);
  }

  @Post('webhook')
  @ApiOkResponse({ description: 'Webhook processado' })
  async handleWebhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.stripeService.handleWebhookEvent(payload, signature);
    return { received: true };
  }
}
