import { ApiProperty } from '@nestjs/swagger';

export class PlantResponseDto {
  @ApiProperty({ example: '68235c12c5a4e8e70db0ea22' })
  id: string;
  @ApiProperty({ example: 'Abelia × grandiflora' })
  scientific_name: string;
  @ApiProperty({ example: ['Glossy abelia'] })
  family_name: string;
  @ApiProperty({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'Array of image URLs',
  })
  images: string[];
  @ApiProperty({
    example: ['Glossy abelia'],
    description: 'Common names of the plant',
  })
  common_name: string[];

  description: string;
}
