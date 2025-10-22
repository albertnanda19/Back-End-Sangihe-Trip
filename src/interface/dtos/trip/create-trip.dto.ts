import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TripItemDto {
  @IsString()
  @IsNotEmpty()
  destinationId: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  activity: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class TripDayDto {
  @IsNumber()
  day: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TripItemDto)
  items: TripItemDto[];
}

class BudgetDto {
  @IsOptional()
  @IsNumber()
  transport?: number;
  @IsOptional()
  @IsNumber()
  lodging?: number;
  @IsOptional()
  @IsNumber()
  food?: number;
  @IsOptional()
  @IsNumber()
  activities?: number;
}

export class CreateTripDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  peopleCount: number;

  @IsString()
  tripType: string;

  @IsBoolean()
  isPublic: boolean;

  @IsArray()
  @ArrayNotEmpty()
  destinations: string[];

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TripDayDto)
  schedule: TripDayDto[];

  @ValidateNested()
  @Type(() => BudgetDto)
  budget: BudgetDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  packingList?: string[];
}
