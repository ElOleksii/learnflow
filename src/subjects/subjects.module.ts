import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { TopicsModule } from 'src/topics/topics.module';

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService],
  imports: [TopicsModule],
})
export class SubjectsModule {}
