import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Review, Topic, User } from 'generated/prisma/client';
import { TopicStatus } from 'src/common/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScheduleService } from './schedule.service';

type PrismaMock = {
  user: { findUnique: jest.Mock };
  review: { findMany: jest.Mock };
  topic: { findMany: jest.Mock };
};

const USER_ID = 'user-1';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: USER_ID,
    email: 'a@b.com',
    name: 'Test',
    password: 'hash',
    streakDays: 0,
    lastStudyDate: null,
    dailyMinutes: 60,
    createdAt: new Date('2026-06-30T08:00:00Z'),
    ...overrides,
  };
}

let reviewSeq = 0;
function makeReview(overrides: Partial<Review> = {}): Review {
  reviewSeq += 1;
  return {
    id: `review-${reviewSeq}`,
    topicId: `topic-${reviewSeq}`,
    userId: USER_ID,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: new Date('2026-06-29T00:00:00Z'),
    createdAt: new Date('2026-06-01T00:00:00Z'),
    ...overrides,
  };
}

let topicSeq = 0;
function makeTopic(overrides: Partial<Topic> = {}): Topic {
  topicSeq += 1;
  return {
    id: `t-${topicSeq}`,
    name: `Topic ${topicSeq}`,
    description: null,
    estimatedMinutes: 30,
    order: topicSeq,
    status: TopicStatus.NOT_STARTED,
    subjectId: 'subject-1',
    createdAt: new Date('2026-06-01T00:00:00Z'),
    ...overrides,
  };
}

describe('ScheduleService.getDailyPlan', () => {
  let service: ScheduleService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    reviewSeq = 0;
    topicSeq = 0;

    prisma = {
      user: { findUnique: jest.fn() },
      review: { findMany: jest.fn().mockResolvedValue([]) },
      topic: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = moduleRef.get(ScheduleService);
  });

  describe('user validation', () => {
    test('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getDailyPlan(USER_ID)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    test('looks the user up by id', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await service.getDailyPlan(USER_ID);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: USER_ID },
      });
    });
  });

  describe('review selection / budgeting', () => {
    test('includes every due review while the daily budget allows (10 min each)', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ dailyMinutes: 25 }));
      const reviews = [makeReview(), makeReview(), makeReview()];
      prisma.review.findMany.mockResolvedValue(reviews);

      const plan = await service.getDailyPlan(USER_ID);

      // 25 min budget / 10 per review => only the first two fit.
      expect(plan.reviews).toEqual([reviews[0], reviews[1]]);
    });

    test('stops adding reviews as soon as the remaining budget drops below 10', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ dailyMinutes: 10 }));
      const reviews = [makeReview(), makeReview()];
      prisma.review.findMany.mockResolvedValue(reviews);

      const plan = await service.getDailyPlan(USER_ID);

      expect(plan.reviews).toEqual([reviews[0]]);
    });

    test('returns no reviews when the budget is under one review', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ dailyMinutes: 9 }));
      prisma.review.findMany.mockResolvedValue([makeReview()]);

      const plan = await service.getDailyPlan(USER_ID);

      expect(plan.reviews).toEqual([]);
    });

    test('queries due reviews up to the end of today, ordered by next review date', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-06-30T13:45:30.500Z'));
      try {
        prisma.user.findUnique.mockResolvedValue(makeUser());

        await service.getDailyPlan(USER_ID);

        const arg = prisma.review.findMany.mock.calls[0][0];
        expect(arg.where.userId).toBe(USER_ID);
        expect(arg.orderBy).toEqual({ nextReviewDate: 'asc' });

        const cutoff: Date = arg.where.nextReviewDate.lte;
        const endOfToday = new Date('2026-06-30T13:45:30.500Z');
        endOfToday.setHours(23, 59, 59, 999);
        expect(cutoff.getTime()).toBe(endOfToday.getTime());
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('topic selection / budgeting', () => {
    test('only requests eligible topics (own subject, startable, prerequisites done)', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await service.getDailyPlan(USER_ID);

      expect(prisma.topic.findMany).toHaveBeenCalledWith({
        where: {
          subject: { userId: USER_ID },
          status: {
            in: [TopicStatus.NOT_STARTED, TopicStatus.IN_PROGRESS],
          },
          prerequisites: { every: { status: 'DONE' } },
        },
        orderBy: { order: 'asc' },
      });
    });

    test('packs topics that fit into the budget left after reviews', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ dailyMinutes: 60 }));
      prisma.review.findMany.mockResolvedValue([makeReview()]); // -10 => 50 left
      const topics = [
        makeTopic({ estimatedMinutes: 30 }),
        makeTopic({ estimatedMinutes: 20 }),
      ];
      prisma.topic.findMany.mockResolvedValue(topics);

      const plan = await service.getDailyPlan(USER_ID);

      expect(plan.topics).toEqual(topics);
    });

    test('stops at the first over-budget topic to preserve order, even if a later one would fit', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ dailyMinutes: 40 }));
      const topics = [
        makeTopic({ estimatedMinutes: 50, order: 1 }), // too big -> stop here
        makeTopic({ estimatedMinutes: 30, order: 2 }), // would fit, but never reached
        makeTopic({ estimatedMinutes: 15, order: 3 }),
      ];
      prisma.topic.findMany.mockResolvedValue(topics);

      const plan = await service.getDailyPlan(USER_ID);

      // 40 budget: first topic (50) exceeds it, so we break and schedule nothing.
      expect(plan.topics).toEqual([]);
    });

    test('stops scheduling topics once the budget runs out mid-sequence', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ dailyMinutes: 40 }));
      const topics = [
        makeTopic({ estimatedMinutes: 30, order: 1 }), // fits -> 10 left
        makeTopic({ estimatedMinutes: 15, order: 2 }), // doesn't fit -> stop
        makeTopic({ estimatedMinutes: 5, order: 3 }), // never reached
      ];
      prisma.topic.findMany.mockResolvedValue(topics);

      const plan = await service.getDailyPlan(USER_ID);

      expect(plan.topics).toEqual([topics[0]]);
    });

    test('includes a zero-minute topic even when the budget is exhausted', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ dailyMinutes: 30 }));
      const topics = [
        makeTopic({ estimatedMinutes: 30 }),
        makeTopic({ estimatedMinutes: 0 }),
      ];
      prisma.topic.findMany.mockResolvedValue(topics);

      const plan = await service.getDailyPlan(USER_ID);

      expect(plan.topics).toEqual(topics);
    });
  });

  describe('minutesUsed accounting', () => {
    test('reports the total minutes consumed by reviews and topics', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ dailyMinutes: 60 }));
      prisma.review.findMany.mockResolvedValue([makeReview(), makeReview()]); // 20
      prisma.topic.findMany.mockResolvedValue([
        makeTopic({ estimatedMinutes: 25 }),
      ]); // 25

      const plan = await service.getDailyPlan(USER_ID);

      expect(plan.minutesUsed).toBe(45);
    });

    test('is zero when nothing is scheduled', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ dailyMinutes: 60 }));

      const plan = await service.getDailyPlan(USER_ID);

      expect(plan).toEqual({ reviews: [], topics: [], minutesUsed: 0 });
    });
  });
});
