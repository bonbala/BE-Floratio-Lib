// src/plants/dto/create-plant.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetailDto {
  @ApiProperty({
    description: 'Phân loại chi tiết, ví dụ: “Mô tả”, “Phân bố”',
    example: 'Mô tả',
  })
  @IsString()
  @IsNotEmpty()
  category: string; // :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

  @ApiProperty({
    description: 'Nội dung chi tiết tương ứng với category',
    example: 'Cây thân gỗ cao đến 10m, vỏ màu nâu...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateSectionDto {
  @ApiProperty({
    description: 'Tên phần thông tin, ví dụ: “Đặc điểm sinh học”',
    example: 'Đặc điểm sinh học',
  })
  @IsString()
  @IsNotEmpty()
  section_name: string; // :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}

  @ApiProperty({
    description: 'Danh sách các chi tiết thuộc phần này',
    type: [CreateDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetailDto)
  details: CreateDetailDto[];
}

export class CreatePlantDto {
  @ApiProperty({
    description: 'Tên khoa học (bắt buộc)',
    example: 'Ficus lyrata',
  })
  @IsString()
  @IsNotEmpty()
  scientific_name: string;

  @ApiPropertyOptional({
    description: 'Tên thông dụng (không bắt buộc)',
    example: 'Fiddle Leaf Fig',
  })
  @IsString()
  @IsOptional()
  common_name?: string;

  @ApiPropertyOptional({
    description: 'Danh sách URL ảnh (nếu đã upload trước)',
    type: [String],
    example: ['https://.../ficus1.jpg', 'https://.../ficus2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_url?: string[];

  @ApiProperty({
    description: 'Các mục thông tin chi tiết của cây',
    type: [CreateSectionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  info_sections: CreateSectionDto[];

  @ApiProperty({
    description: 'Tên ngành (phylum) của cây',
    example: 'Magnoliophyta',
  })
  @IsString()
  @IsNotEmpty()
  phylum: string;

  @ApiProperty({
    description: 'Tên họ (family) của cây',
    example: 'Moraceae',
  })
  @IsString()
  @IsNotEmpty()
  family: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách ObjectId của Attribute',
    example: ['Full Sun', 'Lots of Water'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attributes?: string[];
}
