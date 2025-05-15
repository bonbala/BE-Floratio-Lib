import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContributeStatus } from '../schemas/contribute.schema';
import { SpeciesDescriptionDto } from './create-contribute.dto';

export class ContributeResponseDto {
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
  common_name: string[];
  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  description?: string;

  // đây là mảng string tên attribute
  @ApiPropertyOptional({ description: 'Ảnh đầu tiên (URL)' })
  attributes: string[];

  images: string[];
  species_description?: SpeciesDescriptionDto[];

  suggested_family?: string;

  @ApiProperty({
    enum: ['pending', 'approved', 'rejected'],
    description: 'Trạng thái',
  })
  status: ContributeStatus;

  // nếu cần hiển thị ai review
  @ApiPropertyOptional({
    description: 'Thông tin reviewer',
    example: { _id: '60f7fa22...', username: 'admin1' },
  })
  reviewed_by?: {
    _id: string;
    username: string;
  };
  review_message?: string;

  @ApiProperty({ type: Date, description: 'Ngày tạo' })
  createdAt: Date;
  @ApiProperty({ type: Date, description: 'Ngày cập nhật' })
  updatedAt: Date;
}
