// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString({ message: 'roleName không được để trống' })
  roleName: string;

  @IsBoolean()
  is_banned: false;
}
