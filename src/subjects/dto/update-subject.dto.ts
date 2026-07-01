import { IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SubjectStatus } from 'src/common/types';

export class UpdateSubjectDto {
  @ApiPropertyOptional({
    example: 'Mathematics',
    description: 'Name of the subject',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Advanced calculus',
    description: 'Longer description of the subject',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 5,
    example: 3,
    description: 'Priority score used for scheduling (1-5)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  score?: number;

  @ApiPropertyOptional({
    enum: SubjectStatus,
    example: SubjectStatus.ACTIVE,
    description: 'Current status of the subject',
  })
  @IsOptional()
  @IsEnum(SubjectStatus)
  status?: SubjectStatus;

  @ApiPropertyOptional({
    example: 5,
    description: 'Study hours allocated to this subject per week',
  })
  @IsOptional()
  @IsInt()
  hoursPerWeek?: number;
}
