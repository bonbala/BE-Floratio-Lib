// src/modules/contribute/dto/update-contribute.dto.ts
import {
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  ArrayUnique,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContributePlantDto } from './create-contribute.dto';

export class UpdateContributeDataDto {
  /** Ảnh mới thay thế toàn bộ mảng new_images cũ */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  new_images?: string[];

  /** Thay đổi vào plant (partial) */
  @IsOptional()
  @ValidateNested()
  @Type(() => ContributePlantDto)
  plant?: ContributePlantDto;
}

export class UpdateContributeDto {
  @IsOptional()
  @IsString()
  c_message?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateContributeDataDto)
  data?: UpdateContributeDataDto;
}
