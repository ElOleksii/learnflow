import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/types';
import { UpdateTopicStatus } from './dto/update-topic-status.dto';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get(':id')
  getTopicsBySubject(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.topicsService.getTopicsBySubject(user.sub, id);
  }

  @Patch(':id/status')
  updateTopicStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() status: UpdateTopicStatus,
  ) {
    return this.topicsService.updateTopicStatus(user.sub, id, status);
  }
}
