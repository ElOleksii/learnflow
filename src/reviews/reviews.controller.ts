import { Controller, Post, Param, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type JwtPayload } from 'src/common/types';
import { CompleteReviewDto } from './dto/complete-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':reviewId')
  completeReview(
    @CurrentUser() user: JwtPayload,
    @Param('reviewId') reviewId: string,
    @Body() data: CompleteReviewDto,
  ) {
    return this.reviewsService.completeReview(user.sub, reviewId, data);
  }
}
