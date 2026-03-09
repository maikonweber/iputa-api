import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    example: 'Maria',
    description: 'Nome do perfil',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'feminino',
    description: 'Genero do perfil',
  })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiPropertyOptional({
    example: 25,
    minimum: 18,
    description: 'Idade minima de 18 anos',
  })
  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number;

  @ApiPropertyOptional({
    example: 'Atendimento premium na regiao central',
    description: 'Descricao livre do perfil',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '11999999999',
    description: 'Contato de WhatsApp',
  })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID da cidade associada ao perfil',
  })
  @IsUUID()
  cityId: string;

  @ApiPropertyOptional({
    example: 'Centro',
    description: 'Bairro do perfil',
  })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiProperty({
    example: 250,
    minimum: 0,
    description: 'Valor por hora do atendimento',
  })
  @IsNumber()
  @Min(0)
  priceHour: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se o perfil esta ativo',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
