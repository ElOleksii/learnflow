import { Injectable, NotFoundException } from '@nestjs/common';
import { Review, Topic } from 'generated/prisma/client';
import { TopicStatus } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDailyPlan(
    userId: string,
  ): Promise<{ reviews: Review[]; topics: Topic[]; minutesUsed: number }> {
    // 1. read and validate user

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException();
    }

    // 2. get all user's reviews and topics

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const REVIEW_TIME = 10; // in minutes

    const userReviews = await this.prismaService.review.findMany({
      where: { userId: user.id, nextReviewDate: { lte: today } },
      orderBy: { nextReviewDate: 'asc' },
    });

    // 3. calculate time

    let { dailyMinutes } = user;

    const reviews: Array<Review> = [];

    for (const rev of userReviews) {
      if (dailyMinutes < REVIEW_TIME) break;

      dailyMinutes -= REVIEW_TIME;
      reviews.push(rev);
    }

    const userTopics = await this.prismaService.topic.findMany({
      where: {
        subject: { userId: user.id },
        status: { in: [TopicStatus.NOT_STARTED, TopicStatus.IN_PROGRESS] },
        prerequisites: { every: { status: 'DONE' } },
      },
      orderBy: { order: 'asc' },
    });

    const topics: Array<Topic> = [];

    for (const topic of userTopics) {
      if (topic.estimatedMinutes <= dailyMinutes) {
        dailyMinutes -= topic.estimatedMinutes;
        topics.push(topic);
      } else break;
    }

    return { reviews, topics, minutesUsed: user.dailyMinutes - dailyMinutes };
  }
}
