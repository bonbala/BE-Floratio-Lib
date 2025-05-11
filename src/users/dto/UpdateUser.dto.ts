// src/users/dto/UpdateUser.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Tên hiển thị mới (nếu muốn thay đổi)',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  displayName?: string; // :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}

  @ApiPropertyOptional({
    description: 'URL avatar của người dùng',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
