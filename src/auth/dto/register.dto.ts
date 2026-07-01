import { IsString, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to register with',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    minLength: 4,
    maxLength: 32,
    description: 'Display name',
  })
  @IsString()
  @Length(4, 32)
  name: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    minLength: 8,
    maxLength: 32,
    description: 'Account password',
  })
  @IsString()
  @Length(8, 32)
  password: string;
}
