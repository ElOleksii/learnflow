import { IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteReviewDto {
  @ApiProperty({
    minimum: 0,
    maximum: 5,
    example: 4,
    description:
      'Recall quality rating (0-5) fed into the SM-2 spaced-repetition algorithm',
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  quality: number;
}
