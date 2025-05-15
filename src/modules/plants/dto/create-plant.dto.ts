// src/dto/create-plant.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TableItemDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsString() @IsNotEmpty()
  content: string;
}

class SpeciesDescriptionDto {
  @IsString() @IsNotEmpty()
  title: string;

  @IsArray() @ValidateNested({ each: true })
  @Type(() => TableItemDto)
  tables: TableItemDto[];
}

export class CreatePlantDto {
  @IsString() @IsNotEmpty()
  scientific_name: string;

  @IsArray() @IsOptional()
  @IsString({ each: true })
  common_name?: string[];

  @IsString() @IsNotEmpty()
  family: string; // name

  @IsArray() @ArrayNotEmpty()
  @IsString({ each: true })
  attributes: string[]; // names

  @IsOptional()
  images?: any; // handled by Multer

  @IsArray() @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SpeciesDescriptionDto)
  species_description?: SpeciesDescriptionDto[];
}