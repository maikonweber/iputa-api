import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  SKIN_COLORS,
  HAIR_COLORS,
  EYE_COLORS,
  BODY_TYPES,
  ETHNICITIES,
} from '../constants/profile-categories';

export class CreateProfileDto {
  @ApiProperty({ example: 'Maria', description: 'Nome do perfil' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'feminino', description: 'Genero do perfil' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiPropertyOptional({ example: 25, minimum: 18, description: 'Idade minima de 18 anos' })
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

  @ApiPropertyOptional({ example: '11999999999', description: 'Contato de WhatsApp' })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({ example: '@usuario', description: 'Contato de Telegram' })
  @IsOptional()
  @IsString()
  telegram?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID da cidade associada ao perfil',
  })
  @IsUUID()
  cityId: string;

  @ApiPropertyOptional({ example: 'Centro', description: 'Bairro do perfil' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Rua Augusta, 1200', description: 'Endereco completo' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '01304-001', description: 'CEP / codigo postal' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: -23.5505199, description: 'Latitude para geolocalizacao' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -46.6333094, description: 'Longitude para geolocalizacao' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: 'morena',
    enum: SKIN_COLORS,
    description: 'Cor da pele',
  })
  @IsOptional()
  @IsIn(SKIN_COLORS as unknown as string[])
  skinColor?: string;

  @ApiPropertyOptional({
    example: 'preta',
    enum: HAIR_COLORS,
    description: 'Cor do cabelo',
  })
  @IsOptional()
  @IsIn(HAIR_COLORS as unknown as string[])
  hairColor?: string;

  @ApiPropertyOptional({
    example: 'castanho',
    enum: EYE_COLORS,
    description: 'Cor dos olhos',
  })
  @IsOptional()
  @IsIn(EYE_COLORS as unknown as string[])
  eyeColor?: string;

  @ApiPropertyOptional({
    example: 'fitness',
    enum: BODY_TYPES,
    description: 'Tipo de corpo',
  })
  @IsOptional()
  @IsIn(BODY_TYPES as unknown as string[])
  bodyType?: string;

  @ApiPropertyOptional({
    example: 'latina',
    enum: ETHNICITIES,
    description: 'Etnia',
  })
  @IsOptional()
  @IsIn(ETHNICITIES as unknown as string[])
  ethnicity?: string;

  @ApiPropertyOptional({ example: 168, description: 'Altura em cm' })
  @IsOptional()
  @IsInt()
  @Min(100)
  height?: number;

  @ApiPropertyOptional({ example: 58, description: 'Peso em kg' })
  @IsOptional()
  @IsInt()
  @Min(30)
  weight?: number;

  @ApiPropertyOptional({ example: true, description: 'Possui local proprio' })
  @IsOptional()
  @IsBoolean()
  hasPlace?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Atende em hoteis' })
  @IsOptional()
  @IsBoolean()
  attendsHotels?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Atende em residencias' })
  @IsOptional()
  @IsBoolean()
  attendsHomes?: boolean;

  @ApiProperty({ example: 250, minimum: 0, description: 'Valor por hora do atendimento' })
  @IsNumber()
  @Min(0)
  priceHour: number;

  @ApiPropertyOptional({ example: 1800, minimum: 0, description: 'Valor por pernoite' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceNight?: number;

  @ApiPropertyOptional({ example: true, description: 'Indica se o perfil esta ativo' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
