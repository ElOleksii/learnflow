import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { applyReview } from './domain/sm-2';
import { CompleteReviewDto } from './dto/complete-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async completeReview(
    userId: string,
    reviewId: string,
    data: CompleteReviewDto,
  ) {
    const review = await this.prismaService.review.findUnique({
      where: {
        id: reviewId,
        userId,
      },
    });

    if (!review) {
      throw new NotFoundException(
        "Couldn't be able to find review with provided reviewId",
      );
    }

    const newState = applyReview(
      {
        easeFactor: review.easeFactor,
        interval: review.interval,
        repetitions: review.repetitions,
      },
      data.quality,
    );

    const newNextReviewDate = new Date();
    newNextReviewDate.setDate(newNextReviewDate.getDate() + newState.interval);

    const updatedReview = await this.prismaService.review.update({
      where: {
        id: review.id,
      },
      data: {
        easeFactor: newState.easeFactor,
        interval: newState.interval,
        repetitions: newState.repetitions,
        nextReviewDate: newNextReviewDate,
      },
    });

    return updatedReview;
  }
}
