import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetReviewsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @IsEnum(['newest', 'oldest', 'highest', 'lowest', 'helpful'])
  @IsOptional()
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' = 'newest';
}
