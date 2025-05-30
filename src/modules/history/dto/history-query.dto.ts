// src/history/dto/history-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class HistoryQueryDto {
  @ApiPropertyOptional({ description: 'Trang hiện tại', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Số bản ghi/trang', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    enum: ['update', 'delete'],
    description: 'Lọc theo action',
  })
  @IsOptional()
  @IsEnum(['update', 'delete'])
  action?: 'update' | 'delete';

  @ApiPropertyOptional({
    description: 'Lọc theo Plant ID',
    example: '65faa71c8e8d33e9b0d3ac42',
  })
  @IsOptional()
  @IsString()
  plant?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo User ID',
    example: '64e38e0b23fe0f73c4d3b991',
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
