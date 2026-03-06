import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Length(4, 32)
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
