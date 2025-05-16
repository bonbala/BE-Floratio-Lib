import { PartialType } from '@nestjs/mapped-types';
import { CreateContributeDto } from './create-contribute.dto';
import { IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ContributeStatus } from '../schemas/contribute.schema';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContributeType } from '../schemas/contribute.schema';

export class UpdateContributeDto extends PartialType(CreateContributeDto) {
  @ApiPropertyOptional({
    description: 'Trạng thái contribution',
    enum: ContributeStatus,
    example: ContributeStatus.approved,
  })
  @IsOptional()
  @IsEnum(ContributeStatus)
  status?: ContributeStatus;

  @ApiPropertyOptional({
    description: 'Loại đóng góp',
    enum: ContributeType,
  })
  @IsOptional()
  @IsEnum(ContributeType)
  type?: ContributeType;

  @ApiPropertyOptional({
    description: 'Lý do từ chối (nếu có)',
    example: 'Thiếu hình ảnh',
  })
  @IsOptional()
  @IsString()
  review_message?: string;
}
