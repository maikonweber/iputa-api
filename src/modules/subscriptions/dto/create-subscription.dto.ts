import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID do perfil assinado',
  })
  @IsUUID()
  profile_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID do plano contratado',
  })
  @IsUUID()
  plan_id: string;

  @ApiProperty({
    example: '2026-03-06',
    description: 'Data de inicio da assinatura',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    example: '2026-04-06',
    description: 'Data de fim da assinatura',
  })
  @IsDateString()
  end_date: string;
}
