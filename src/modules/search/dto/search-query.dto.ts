import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  BODY_TYPES,
  ETHNICITIES,
  EYE_COLORS,
  HAIR_COLORS,
  SKIN_COLORS,
} from '../../profiles/constants/profile-categories';

export const SEARCH_SORT_VALUES = [
  'created_desc',
  'created_asc',
  'price_hour_asc',
  'price_hour_desc',
  'price_night_asc',
  'price_night_desc',
] as const;

function queryOptionalBoolean({ value }: { value: unknown }): boolean | undefined {
  if (value === '' || value === undefined || value === null) return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value as boolean | undefined;
}

/** Query param com varios valores separados por virgula (ex.: `azul,verde`). */
function splitCsvEnum(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parts = String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

function trimOptionalString({ value }: { value: unknown }): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s === '' ? undefined : s;
}

export class SearchQueryDto {
  @ApiPropertyOptional({
    example: 'sao-paulo',
    description: 'Slug da cidade (comparacao sem diferenciar maiusculas)',
  })
  @IsOptional()
  @Transform(trimOptionalString)
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'feminino',
    description: 'Genero (comparacao sem diferenciar maiusculas)',
  })
  @IsOptional()
  @Transform(trimOptionalString)
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    example: 'maria',
    description: 'Busca por padrao no nome ou na descricao (sem caracteres curinga; % e _ sao literais)',
  })
  @IsOptional()
  @Transform(trimOptionalString)
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Preco minimo por hora',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsNumber()
  @Min(0)
  price_min?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Preco maximo por hora',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsNumber()
  @Min(0)
  price_max?: number;

  @ApiPropertyOptional({
    example: 800,
    description: 'Preco minimo por pernoite',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsNumber()
  @Min(0)
  price_night_min?: number;

  @ApiPropertyOptional({
    example: 3000,
    description: 'Preco maximo por pernoite',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsNumber()
  @Min(0)
  price_night_max?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Possui local proprio',
  })
  @IsOptional()
  @Transform(queryOptionalBoolean)
  @IsBoolean()
  has_place?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Atende em hoteis',
  })
  @IsOptional()
  @Transform(queryOptionalBoolean)
  @IsBoolean()
  attends_hotels?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Atende em residencias',
  })
  @IsOptional()
  @Transform(queryOptionalBoolean)
  @IsBoolean()
  attends_homes?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Apenas perfis verificados',
  })
  @IsOptional()
  @Transform(queryOptionalBoolean)
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({
    example: 'castanho,preto',
    description: 'Cor(es) dos olhos; varios valores separados por virgula (OR)',
  })
  @IsOptional()
  @Transform(({ value }) => splitCsvEnum(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsIn(EYE_COLORS as unknown as string[], { each: true })
  eye_color?: string[];

  @ApiPropertyOptional({
    example: 'preta,loira',
    description: 'Cor(es) do cabelo; varios valores separados por virgula (OR)',
  })
  @IsOptional()
  @Transform(({ value }) => splitCsvEnum(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsIn(HAIR_COLORS as unknown as string[], { each: true })
  hair_color?: string[];

  @ApiPropertyOptional({
    example: 'morena,parda',
    description: 'Cor(es) da pele; varios valores separados por virgula (OR)',
  })
  @IsOptional()
  @Transform(({ value }) => splitCsvEnum(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsIn(SKIN_COLORS as unknown as string[], { each: true })
  skin_color?: string[];

  @ApiPropertyOptional({
    example: 'fitness,atletica',
    description: 'Tipo(s) de corpo; varios valores separados por virgula (OR)',
  })
  @IsOptional()
  @Transform(({ value }) => splitCsvEnum(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsIn(BODY_TYPES as unknown as string[], { each: true })
  body_type?: string[];

  @ApiPropertyOptional({
    example: 'latina',
    description: 'Etnia(s); varios valores separados por virgula (OR)',
  })
  @IsOptional()
  @Transform(({ value }) => splitCsvEnum(value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsIn(ETHNICITIES as unknown as string[], { each: true })
  ethnicity?: string[];

  @ApiPropertyOptional({
    example: 18,
    description: 'Idade minima (anos)',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(18)
  @Max(99)
  age_min?: number;

  @ApiPropertyOptional({
    example: 45,
    description: 'Idade maxima (anos)',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(18)
  @Max(99)
  age_max?: number;

  @ApiPropertyOptional({
    example: 160,
    description: 'Altura minima em cm',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(100)
  @Max(250)
  height_min?: number;

  @ApiPropertyOptional({
    example: 180,
    description: 'Altura maxima em cm',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(100)
  @Max(250)
  height_max?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Peso minimo em kg',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(30)
  @Max(200)
  weight_min?: number;

  @ApiPropertyOptional({
    example: 70,
    description: 'Peso maximo em kg',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(30)
  @Max(200)
  weight_max?: number;

  @ApiPropertyOptional({
    example: 24,
    description: 'Maximo de resultados (paginacao)',
    default: 30,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Deslocamento de resultados (paginacao)',
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    example: 'created_desc',
    enum: SEARCH_SORT_VALUES,
    description: 'Ordenacao dos resultados',
    default: 'created_desc',
  })
  @IsOptional()
  @IsIn(SEARCH_SORT_VALUES as unknown as string[])
  sort?: (typeof SEARCH_SORT_VALUES)[number];
}
