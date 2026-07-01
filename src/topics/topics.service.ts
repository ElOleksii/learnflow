import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TopicStatus } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTopicStatus } from './dto/update-topic-status.dto';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class TopicsService {
  constructor(
    private readonly prismaService: PrismaService,
    private aiService: AiService,
  ) {}
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
    dto: UpdateTopicStatus,
  ) {
    const topic = await this.prismaService.topic.findUnique({
      where: { id: topicId },
      include: { subject: true },
    });

    if (!topic || topic.subject.userId !== userId)
      throw new NotFoundException();

    const { status } = dto;

    if (status === TopicStatus.DONE) {
      const interval = 1;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const existing = await this.prismaService.review.findUnique({
        where: {
          topicId,
        },
      });

      if (existing) {
        throw new ConflictException();
      }

      const [review, updatedTopic] = await this.prismaService.$transaction([
        this.prismaService.review.create({
          data: {
            topicId,
            userId,
            nextReviewDate: tomorrow,
            interval,
          },
        }),
        this.prismaService.topic.update({
          where: {
            id: topicId,
          },
          data: {
            status,
          },
        }),
      ]);

      return { updatedTopic, review };
    } else {
      return await this.prismaService.topic.update({
        where: { id: topic.id },
        data: { status },
      });
    }
  }

  async generateRoadmapBySubject(userId: string, subjectId: string) {
    const subject = await this.prismaService.subject.findUnique({
      where: { id: subjectId, userId },
    });

    if (!subject) {
      throw new NotFoundException();
    }
    // Delete all topics on subject if they exist
    await this.prismaService.topic.deleteMany({
      where: { subjectId: subject.id },
    });

    const topicsArr = await this.aiService.generateRoadmap(subject.name);

    const createdTopics = await Promise.all(
      topicsArr.map((t) =>
        this.prismaService.topic.create({
          data: {
            subjectId: subject.id,
            name: t.name,
            description: t.description,
            order: t.order,
            estimatedMinutes: t.estimatedMinutes,
          },
        }),
      ),
    );

    const topicMap = new Map(createdTopics.map((t) => [t.name, t.id]));

    for (const topic of topicsArr) {
      if (!topic.prerequisites.length) continue;

      const topicId = topicMap.get(topic.name);

      await this.prismaService.topic.update({
        where: { id: topicId },
        data: {
          prerequisites: {
            connect: topic.prerequisites
              .map((name) => topicMap.get(name))
              .filter(Boolean)
              .map((id) => ({ id: id })),
          },
        },
      });
    }

    return createdTopics;
  }

  async getSortedTopics(subjectId: string) {
    const topics = await this.prismaService.topic.findMany({
      where: {
        subjectId,
      },
      include: { prerequisites: true, prerequisitesFor: true },
    });

    const sorted: typeof topics = [];
    const visited = new Set<string>();

    for (const topic of topics) {
      if (!visited.has(topic.id)) {
        visit(topic);
      }
    }

    return sorted;

    function visit(topic: (typeof topics)[number]) {
      if (visited.has(topic.id)) return;

      for (const p of topic.prerequisites) {
        visit(p as typeof topic);
      }

      visited.add(topic.id);
      sorted.push(topic);
    }
  }
}
