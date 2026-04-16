import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';
import { GrantSubscriptionDto } from './dto/grant-subscription.dto';

@ApiTags('admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' })
@ApiForbiddenResponse({ description: 'Conta suspensa ou sem permissao de admin' })
@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminSubscriptionsController {
  constructor(private readonly adminService: AdminService) {}

  @Post('grant')
  @ApiCreatedResponse({ description: 'Assinatura concedida ao perfil (sem Stripe)' })
  grantSubscription(@Body() dto: GrantSubscriptionDto) {
    return this.adminService.grantSubscription(dto);
  }
}
