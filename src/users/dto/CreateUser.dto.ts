import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  displayName?: string;
}
