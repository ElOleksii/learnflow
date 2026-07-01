import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TopicStatus } from 'src/common/types';

export class UpdateTopicStatus {
  @ApiProperty({
    enum: TopicStatus,
    example: TopicStatus.IN_PROGRESS,
    description: 'New status to assign to the topic',
  })
  @IsEnum(TopicStatus)
  status: TopicStatus;
}
