import { IsOptional, IsInt, Min, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class MyReviewsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  per_page?: number;

  @IsOptional()
  @IsIn(['date', 'rating'])
  sortBy?: 'date' | 'rating';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '3', '4', '5', 'all'])
  rating?: '1' | '2' | '3' | '4' | '5' | 'all';
}
