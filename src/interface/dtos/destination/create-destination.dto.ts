import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

class FacilityDto {
  @IsString()
  name: string;
  @IsString()
  icon: string;
  @IsNotEmpty()
  available: boolean;
}

export class CreateDestinationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsObject()
  location: LocationDto;

  @IsNumber()
  distanceKm: number;

  @IsNumber()
  price: number;

  @IsString()
  openHours: string;

  @IsString()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => FacilityDto)
  facilities: FacilityDto[];

  @IsArray()
  tips: string[];
}
