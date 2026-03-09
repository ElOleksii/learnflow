import { Injectable, NotFoundException } from '@nestjs/common';
import { TopicStatus } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private readonly prismaService: PrismaService) {}
  async getTopicsBySubject(userId: string, subjectId: string) {
    const subject = await this.prismaService.subject.findUnique({
      where: {
        userId,
        id: subjectId,
      },
    });

    if (!subject) {
      throw new NotFoundException();
    }

    const topic = await this.prismaService.topic.findMany({
      where: { subjectId },
    });

    return topic;
  }
  async updateTopicStatus(
    userId: string,
    topicId: string,
    status: TopicStatus,
  ) {
    const topic = await this.prismaService.topic.findUnique({
      where: { id: topicId },
      include: { subject: true },
    });

    if (!topic || topic.subject.userId !== userId)
      throw new NotFoundException();

    const data: Partial<{
      status: TopicStatus;
      reviewInterval?: number;
      nextReviewDate?: Date;
    }> = { status };

    if (status === TopicStatus.NEEDS_REVIEW) {
      data.reviewInterval = 1;

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      data.nextReviewDate = tomorrow;
    }

    return this.prismaService.topic.update({
      where: {
        id: topicId,
      },
      data,
    });
  }
}
