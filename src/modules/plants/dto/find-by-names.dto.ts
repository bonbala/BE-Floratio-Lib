// src/modules/plants/dto/find-by-names.dto.ts
import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class FindPlantsByNamesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  scientific_names: string[];
}
