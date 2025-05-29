// src/history/dto/create-history.dto.ts
import { Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHistoryDto {
  @ApiProperty({
    type: String,
    description: 'ObjectId của Plant bị tác động',
    example: '65faa71c8e8d33e9b0d3ac42',
  })
  plant: Types.ObjectId;

  @ApiProperty({
    enum: ['update', 'delete'],
    description: 'Loại hành động: update hoặc delete',
  })
  action: 'update' | 'delete';

  @ApiProperty({
    description: 'Snapshot đầy đủ trước khi thay đổi',
    type: Object,
  })
  before: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    description: 'ObjectId của Plant sau khi update (chỉ với action = update)',
    example: '65faa71c8e8d33e9b0d3ac42',
  })
  after?: Types.ObjectId;

  @ApiPropertyOptional({
    type: String,
    description: 'ObjectId của User thực hiện (nếu có)',
    example: '64e38e0b23fe0f73c4d3b991',
  })
  updatedBy?: Types.ObjectId;
}
