import { IsIn, IsOptional } from 'class-validator';

export class LandingPageQueryDto {
  @IsOptional()
  @IsIn(['Semua', 'Pantai', 'Budaya', 'Kuliner', 'Alam'])
  category?: string;
}
