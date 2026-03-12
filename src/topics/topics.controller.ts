import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/types';
import { UpdateTopicStatus } from './dto/update-topic-status.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Patch(':id/status')
  updateTopicStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() status: UpdateTopicStatus,
  ) {
    return this.topicsService.updateTopicStatus(user.sub, id, status);
  }
}
