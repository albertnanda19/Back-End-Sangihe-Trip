import { IsOptional, IsString } from 'class-validator';

export class ApproveReviewDto {
  @IsOptional()
  @IsString()
  moderatorNote?: string;
}

export class RejectReviewDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  moderatorNote?: string;
}
