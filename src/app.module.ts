import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { AiModule } from './ai/ai.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ScheduleService } from './schedule/schedule.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    SubjectsModule,
    TopicsModule,
    AiModule,
    ReviewsModule,
  ],
  providers: [ScheduleService],
})
export class AppModule {}
