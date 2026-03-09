import { IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { SubjectStatus } from 'src/common/types';

export class UpdateSubjectDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  score?: number;

  @IsOptional()
  @IsEnum(SubjectStatus)
  status?: SubjectStatus;

  @IsOptional()
  @IsInt()
  hoursPerWeek?: number;
}
