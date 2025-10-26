import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(['active', 'inactive', 'banned', 'pending'])
  status?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
