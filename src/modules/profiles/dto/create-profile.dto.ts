import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  age?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsInt()
  cityId: number;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsNumber()
  @Min(0)
  priceHour: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
