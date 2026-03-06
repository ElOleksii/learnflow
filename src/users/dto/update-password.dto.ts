import { IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @Length(8, 32)
  oldPassword: string;

  @IsString()
  @Length(8, 32)
  newPassword: string;
}
