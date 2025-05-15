import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContributeSummaryDto {
  @ApiProperty({ type: String, description: 'ID của contribution' })
  _id: string;

  @ApiProperty({
    description: 'Thông tin user tạo',
    example: { _id: '60f7f9c1...', username: 'johndoe' },
  })
  user: {
    _id: string;
    username: string;
  };

  @ApiProperty({ description: 'Tên khoa học' })
  scientific_name: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  description?: string;

  @ApiPropertyOptional({ description: 'Ảnh đầu tiên (URL)' })
  image?: string;

  @ApiProperty({ type: [String], description: 'Danh sách tên attribute' })
  attributes: string[];

  @ApiPropertyOptional({
    description: 'Thông tin reviewer',
    example: { _id: '60f7fa22...', username: 'admin1' },
  })
  reviewed_by?: {
    _id: string;
    username: string;
  };

  @ApiProperty({
    enum: ['pending', 'approved', 'rejected'],
    description: 'Trạng thái',
  })
  status: string;

  @ApiProperty({ type: Date, description: 'Ngày tạo' })
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Ngày cập nhật' })
  updatedAt: Date;
}
