import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchQueryDto {
  @ApiPropertyOptional({
    example: 'sao-paulo',
    description: 'Slug da cidade para filtro',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'feminino',
    description: 'Genero para filtro',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Preco minimo por hora',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price_min?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Preco maximo por hora',
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price_max?: number;
}
