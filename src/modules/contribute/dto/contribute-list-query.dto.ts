// src/modules/contribute/dto/contribute-list-query.dto.ts
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ContributeListQueryDto {
  @IsOptional()
  @IsIn(['create', 'update'])
  type?: 'create' | 'update';

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';

  /** search text cho scientific_name, common_name[] hoặc username  */
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;
}
