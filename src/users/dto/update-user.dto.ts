import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    minLength: 4,
    maxLength: 32,
    description: 'New display name',
  })
  @IsString()
  @Length(4, 32)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'New email address',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
