import {
  IsString,
  IsOptional,
  IsArray,
  ArrayUnique,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TableItemDto {
  @IsString() title: string;
  @IsString() content: string;
}

class SpeciesDescriptionDto {
  @IsString() title: string;

  @IsArray()
  @ArrayUnique()
  @ValidateNested({ each: true })
  @Type(() => TableItemDto)
  tables: TableItemDto[];
}

export class CreateContributeDto {
  @IsString()
  scientific_name: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  common_name?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  attributes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeciesDescriptionDto)
  species_description?: SpeciesDescriptionDto[];

  @IsOptional()
  @IsMongoId()
  suggested_family?: string;
}
