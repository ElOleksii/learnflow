import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { AiModule } from 'src/ai/ai.module';

@Module({
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService],
  imports: [AiModule],
})
export class TopicsModule {}
