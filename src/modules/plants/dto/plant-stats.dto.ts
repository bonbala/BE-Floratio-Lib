import { ApiProperty } from '@nestjs/swagger';

export class FamilyStatDto {
  @ApiProperty({ example: '68234a46c5a4e8e70db0630a' })
  family_id: string;

  @ApiProperty({ example: 'Rosaceae' })
  family_name: string;

  @ApiProperty({ example: 123 })
  count: number;
}

export class PlantStatsResponseDto {
  @ApiProperty({ example: 4881 })
  totalPlants: number;

  @ApiProperty({ type: [FamilyStatDto] })
  families: FamilyStatDto[];
}
