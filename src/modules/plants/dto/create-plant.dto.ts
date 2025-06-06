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
import { ApiProperty } from '@nestjs/swagger';

class TableItemDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

class SpeciesDescriptionDto {
  @IsString()
  @IsNotEmpty()
  section: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableItemDto)
  details: TableItemDto[];
}

export class CreatePlantDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Abelia × grandiflora',
    description: 'Scientific name of the plant',
  })
  scientific_name: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({
    example: ['Glossy abelia'],
    description: 'Common names of the plant',
  })
  common_name?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'Description',
    description: 'Description of the plant',
  })
  description?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Caprifoliaceae',
    description: 'Family name reference',
  })
  family: string; // name

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({
    example: ['Full Sun', 'Moderate Water'],
    description: 'Attributes describing plant care',
  })
  attributes: string[]; // names

  @IsOptional()
  @ApiProperty({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'Array of image URLs',
  })
  images?: any; // handled by Multer

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SpeciesDescriptionDto)
  @ApiProperty({
    example: [
      {
        section: 'Biogeography',
        detail: [
          {
            label: 'Native Distribution',
            content: 'Mexico, Guatemala, Cuba',
          },
        ],
      },
      {
        section: 'Classifications and Characteristics',
        detail: [
          {
            label: 'Plant Division',
            content: 'Angiosperms (Flowering Seed Plants) (Dicotyledon)',
          },
        ],
      },
    ],
    description: 'Species Description',
  })
  species_description?: SpeciesDescriptionDto[];
}
