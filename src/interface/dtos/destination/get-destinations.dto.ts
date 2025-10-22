import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetDestinationsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  @IsOptional()
  @IsEnum(['popular', 'rating', 'price-low', 'newest'])
  sortBy?: 'popular' | 'rating' | 'price-low' | 'newest';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  pageSize?: number = 12;
}

export class DestinationListItemDto {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalReviews: number;
  location: string;
  price: number;
  image: string;
  facilities: string[];
  description: string;
}

export class GetDestinationsMetaDto {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export class GetDestinationsResponseDto {
  data: DestinationListItemDto[];
  meta: GetDestinationsMetaDto;
}
