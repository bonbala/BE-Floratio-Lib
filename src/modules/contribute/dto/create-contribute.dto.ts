import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class CreateContributeDto {
  @IsEnum(['create', 'update'])
  type: 'create' | 'update';

  @IsOptional()
  c_message?: string;

  @ValidateNested()
  @Type(() => ContributePlantDto)
  contribute_plant: ContributePlantDto;

  @IsOptional()
  newImages?: string[];
}
