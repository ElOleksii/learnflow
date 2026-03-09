import { IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';

export enum SubjectStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
}

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
