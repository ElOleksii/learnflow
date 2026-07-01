import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { type JwtPayload } from 'src/common/types';
import { CompleteReviewDto } from './dto/complete-review.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({
    summary: 'Complete a review',
    description:
      'Submits a recall quality rating and advances the review schedule using the SM-2 algorithm.',
  })
  @ApiParam({ name: 'reviewId', description: 'UUID of the review' })
  @ApiResponse({ status: 201, description: 'Review completed successfully.' })
  @ApiResponse({ status: 404, description: 'Review not found.' })
  @Post(':reviewId')
  completeReview(
    @CurrentUser() user: JwtPayload,
    @Param('reviewId') reviewId: string,
    @Body() data: CompleteReviewDto,
  ) {
    return this.reviewsService.completeReview(user.sub, reviewId, data);
  }
}
