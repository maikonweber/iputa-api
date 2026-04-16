import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class GrantSubscriptionDto {
  @ApiProperty({
    description: 'UUID do perfil que recebera o plano',
  })
  @IsUUID()
  profile_id: string;

  @ApiProperty({
    description: 'UUID do plano (nao pode ser o plano gratuito)',
  })
  @IsUUID()
  plan_id: string;

  @ApiPropertyOptional({
    description: 'Se informado, o perfil deve pertencer a este usuario',
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;
}
