import {
  IsString,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdateTripItemDto {
  @IsString()
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

class UpdateTripDayDto {
  @IsNumber()
  day: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTripItemDto)
  items: UpdateTripItemDto[];
}

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  peopleCount?: number;

  @IsOptional()
  @IsString()
  tripType?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  destinations?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTripDayDto)
  schedule?: UpdateTripDayDto[];

  @IsOptional()
  @IsObject()
  budget?: Record<string, number>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  packingList?: string[];
}
