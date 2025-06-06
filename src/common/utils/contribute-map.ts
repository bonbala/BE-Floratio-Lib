// utils/contribute-map.ts
import { CreatePlantDto } from 'src/modules/plants/dto/create-plant.dto';
import { UpdatePlantDto } from 'src/modules/plants/dto/update-plant.dto';

/** map cho type = 'create' */
export function mapToCreatePlantDto(raw: any): CreatePlantDto {
  return {
    scientific_name: raw.scientific_name,
    common_name: raw.common_name ?? [],
    description: raw.description,
    family: raw.family,
    attributes: raw.attributes ?? [],
    images: raw.images ?? [],
    species_description: raw.species_description ?? [],
  };
}

/** map cho type = 'update' (chỉ field có trong raw) */
export function mapToUpdatePlantDto(raw: any): UpdatePlantDto {
  const dto: Record<string, any> = {};
  if (raw.scientific_name) dto.scientific_name = raw.scientific_name;
  if (raw.common_name) dto.common_name = raw.common_name;
  if (raw.description) dto.description = raw.description;
  if (raw.family) dto.family = raw.family;
  if (raw.attributes) dto.attributes = raw.attributes;
  if (raw.images) dto.images = raw.images;
  if (raw.species_description)
    dto.species_description = raw.species_description;
  return dto as UpdatePlantDto;
}
