import {
  IsString,
  IsOptional,
  IsArray,
  //   ArrayUnique,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TableItemDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}

class SpeciesDescriptionDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableItemDto)
  tables: TableItemDto[];
}

export class CreatePlantDto {
  @IsOptional()
  @IsArray()
  //   @ArrayUnique()
  @IsString({ each: true })
  common_name?: string[];

  @IsString()
  scientific_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  //   @ArrayUnique()
  @IsString({ each: true })
  attributes: string[];

  @IsString()
  family: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpeciesDescriptionDto)
  species_description?: SpeciesDescriptionDto[];
}
