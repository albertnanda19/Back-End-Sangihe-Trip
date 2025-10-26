import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminActivityQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(['create', 'update', 'delete', 'login', 'approve', 'reject'])
  action?: string;

  @IsOptional()
  @IsString()
  @IsIn(['user', 'destination', 'review', 'article', 'trip'])
  entityType?: string;

  @IsOptional()
  @IsString()
  adminId?: string;
}
