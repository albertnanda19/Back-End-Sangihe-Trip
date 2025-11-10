import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsDateString,
} from 'class-validator';
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
  @IsIn([
    'create',
    'update',
    'delete',
    'register',
    'login',
  ])
  action?: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'auth',
    'user',
    'destination',
    'review',
    'article',
    'trip_plan',
    'user_profile',
  ])
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string; // Filter by specific entity ID

  @IsOptional()
  @IsString()
  @IsIn(['user', 'admin'])
  actorRole?: string;

  @IsOptional()
  @IsString()
  userId?: string; // Can filter by any user (admin or regular user)

  @IsOptional()
  @IsString()
  search?: string; // Global search query

  @IsOptional()
  @IsString()
  search_fields?: string; // Comma-separated fields to search (entityName,userName,userEmail)

  @IsOptional()
  @IsDateString()
  dateFrom?: string; // Filter activities from this date (ISO format)

  @IsOptional()
  @IsDateString()
  dateTo?: string; // Filter activities to this date (ISO format)

  @IsOptional()
  @IsString()
  ipAddress?: string; // Filter by IP address
}
