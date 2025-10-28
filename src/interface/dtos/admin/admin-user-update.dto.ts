import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned', 'pending'])
  status?: string;

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
