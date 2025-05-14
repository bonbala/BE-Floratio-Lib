import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignupDto {
  @IsNotEmpty() username: string;
  @IsEmail() email: string;
  @MinLength(6) password: string;

  @IsNotEmpty({ message: 'roleName không được để trống' })
  roleName: string;
}
