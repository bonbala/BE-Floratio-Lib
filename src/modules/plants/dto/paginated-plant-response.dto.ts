// src/plants/dto/paginated-plant-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PlantResponseDto } from './plant-response.dto'; // DTO plant đã có sẵn

export class PaginatedPlantResponseDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  pageSize: number;

  @ApiProperty({ example: 49 })
  totalPages: number;

  @ApiProperty({ example: 2102 })
  totalItems: number;

  @ApiProperty({ type: [PlantResponseDto] })
  data: PlantResponseDto[];
}
