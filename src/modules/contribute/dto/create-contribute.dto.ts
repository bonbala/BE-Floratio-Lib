import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ArrayUnique,
  IsMongoId,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContributeType } from '../schemas/contribute.schema';

class TableItemDto {
  @IsString() title: string;
  @IsString() content: string;
}

export class SpeciesDescriptionDto {
  @IsString() title: string;

  @IsArray()
  @ArrayUnique()
  @ValidateNested({ each: true })
  @Type(() => TableItemDto)
  tables: TableItemDto[];
}

export class CreateContributeDto {
  @ApiProperty({ description: 'Tên khoa học', example: 'Abelia × grandiflora' })
  @IsString()
  scientific_name: string;

  @ApiPropertyOptional({
    description: 'Tên thường gọi',
    example: ['Glossy abelia', '大花六道木'],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  common_name?: string[];

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Danh sách attribute ID',
    type: [String],
    example: ['60f7f9c2...', '60f7f9c3...'],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  attributes?: string[];

  @ApiPropertyOptional({
    description: 'Ảnh upload (multipart/form-data)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    description: 'Species description',
    example: [{ title: 'Habitat', content: 'Full sun...' }],
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeciesDescriptionDto)
  species_description?: SpeciesDescriptionDto[];

  @ApiProperty({
    description: 'Loại đóng góp',
    enum: ContributeType,
  })
  @IsEnum(ContributeType)
  type: ContributeType;

  @ApiPropertyOptional({
    description: 'Family ID đề xuất',
    example: '60f7fa00...',
  })
  @IsOptional()
  @IsMongoId()
  suggested_family?: string;
}
