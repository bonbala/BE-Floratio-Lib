// src/users/dto/CreateUser.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class createUserDto {
  @ApiProperty({
    description: 'Tên đăng nhập duy nhất của người dùng',
    example: 'john_doe',
  })
  @IsNotEmpty()
  @IsString()
  username: string; // :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

  @ApiProperty({
    description: 'Tên hiển thị (có thể để trống)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'P@ssw0rd123',
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @ApiProperty({
    description: 'ObjectId của Role (tham chiếu đến collection roles)',
    example: '60d0fe4f5311236168a109ca',
    type: String,
  })
  @IsNotEmpty()
  role: Types.ObjectId;
}
