import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({
    example: 'Mathematics',
    description: 'Name of the subject',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Calculus, linear algebra and probability',
    description: 'Optional longer description of the subject',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
