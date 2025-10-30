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
  @IsIn([
    // User actions
    'register', 'login', 'update_profile', 'change_password',
    'create_trip', 'update_trip', 'delete_trip',
    'submit_review',
    // Admin actions
    'create_destination', 'update_destination',
    'approve_review', 'reject_review'
  ])
  action?: string;

  @IsOptional()
  @IsString()
  @IsIn(['user', 'destination', 'review', 'article', 'trip_plan', 'user_profile'])
  entityType?: string;

  @IsOptional()
  @IsString()
  userId?: string; // Can filter by any user (admin or regular user)

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'user', 'all'])
  userType?: 'admin' | 'user' | 'all' = 'all'; // Default to show all activities
}
