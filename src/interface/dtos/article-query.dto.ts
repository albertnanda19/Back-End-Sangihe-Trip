import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class ArticleQueryDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  per_page?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsIn(['latest', 'oldest', 'popular'])
  @IsOptional()
  sort?: 'latest' | 'oldest' | 'popular' = 'latest';

  @Transform(({ value }) => value !== 'false')
  @IsBoolean()
  @IsOptional()
  include_featured?: boolean = true;

  @Transform(({ value }) => value !== 'false')
  @IsBoolean()
  @IsOptional()
  include_sidebar?: boolean = true;
}
