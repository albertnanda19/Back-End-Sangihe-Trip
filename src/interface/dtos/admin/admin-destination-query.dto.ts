import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminDestinationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn([
    'createdAt:desc',
    'createdAt:asc',
    'name:asc',
    'name:desc',
    'rating:desc',
    'rating:asc',
    'viewCount:desc',
  ])
  sort?: string = 'createdAt:desc';

  @IsOptional()
  @IsString()
  status?: string; // 'active', 'inactive', 'pending', 'rejected'

  @IsOptional()
  @IsString()
  category?: string;
}
