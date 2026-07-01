import { IsNumber, Max, Min } from 'class-validator';

export class CompleteReviewDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  quality: number;
}
