import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  destinationId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  comment: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
