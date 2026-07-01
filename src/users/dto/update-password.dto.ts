import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    minLength: 8,
    maxLength: 32,
    description: 'Current password',
  })
  @IsString()
  @Length(8, 32)
  oldPassword: string;

  @ApiProperty({
    minLength: 8,
    maxLength: 32,
    description: 'New password to set',
  })
  @IsString()
  @Length(8, 32)
  newPassword: string;
}
