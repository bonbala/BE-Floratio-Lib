import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/* ------------ DTO con ------------ */
export class ContributePlantDto {
  @IsNotEmpty()
  scientific_name: string;

  @IsOptional()
  common_name?: string[];

  @IsOptional()
  description?: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  attributes?: string[];

  @IsOptional()
  species_description?: any[];

  @IsOptional()
  family?: string;
}

/* ------------ DTO create ------------ */
export class CreateContributeDto {
  @IsEnum(['create', 'update'])
  type: 'create' | 'update';

  @IsOptional()
  c_message?: string;

  /* ① Parse JSON → object
     ② Dùng @Type TRƯỚC @ValidateNested để ép thành instance */
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value; // để validator báo lỗi JSON sai
      }
    }
    return value;
  })
  @Type(() => ContributePlantDto)  // ⇐ đặt TRƯỚC
  @ValidateNested()
  plant: ContributePlantDto;

  /* newImages: cho phép mảng, JSON string hoặc chuỗi “url1,url2” */
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((s) => s.trim());
      }
    }
    return [];
  })
  @IsOptional()
  newImages?: string[];
}
