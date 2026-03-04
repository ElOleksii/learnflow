import { IsString, IsEmail, Length } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 32)
  name: string;

  @IsString()
  @Length(8, 32)
  password: string;
}
