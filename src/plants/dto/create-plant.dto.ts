import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateDetailDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  section_name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetailDto)
  details: CreateDetailDto[];
}

export class CreatePlantDto {
  @IsString()
  @IsNotEmpty()
  scientific_name: string;

  @IsString()
  @IsOptional()
  common_name?: string;

  @IsArray()
  @IsString({ each: true })
  image_url: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  info_sections: CreateSectionDto[];

  @IsString()
  @IsNotEmpty()
  phylum: string;

  @IsString()
  @IsNotEmpty()
  family: string;
}
