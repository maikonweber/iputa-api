import { Type } from 'class-transformer';
import { IsDateString, IsInt } from 'class-validator';

export class CreateSubscriptionDto {
  @Type(() => Number)
  @IsInt()
  profile_id: number;

  @Type(() => Number)
  @IsInt()
  plan_id: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;
}
