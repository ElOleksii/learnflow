import { IsEnum } from 'class-validator';
import { TopicStatus } from 'src/common/types';

export class UpdateTopicStatus {
  @IsEnum(TopicStatus)
  status: TopicStatus;
}
