// src/dto/plant-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DetailResponse {
  @ApiProperty()
  category: string;

  @ApiProperty()
  content: string;
}

export class SectionResponse {
  @ApiProperty()
  section_name: string;

  @ApiProperty({ type: [DetailResponse] })
  details: DetailResponse[];
}

export class PlantResponseDto {
  @ApiProperty()
  scientific_name: string;

  @ApiProperty({ required: false })
  common_name?: string;

  @ApiProperty({ type: [String] })
  image_url: string[];

  @ApiProperty({ type: [SectionResponse] })
  info_sections: SectionResponse[];

  @ApiProperty()
  phylum: string;

  @ApiProperty()
  family: string;

  @ApiProperty({ type: [String] })
  attributes: string[];
}
