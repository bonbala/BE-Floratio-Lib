import { PaginationQueryDto } from './pagination-query.dto';
import {
  IsOptional,
  IsMongoId,
  IsString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class PlantListQueryDto extends PaginationQueryDto {
  /** Lọc theo 1 family id */
  @IsOptional()
  @IsMongoId()
  family?: string;

  /** Lọc nhiều attribute id: attributes=att1,att2 */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((v: string) => v.trim())
          .filter(Boolean)
      : [],
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  attributes?: string[];

  /** Chuỗi tìm kiếm */
  @IsOptional()
  @IsString()
  search?: string;
}
