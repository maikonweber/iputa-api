import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price_min?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price_max?: number;
}
