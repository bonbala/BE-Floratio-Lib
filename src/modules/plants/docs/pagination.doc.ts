import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { PaginatedPlantResponseDto } from '../dto/paginated-plant-response.dto';

/**
 * Decorator gom toàn bộ mô tả Swagger cho
 *    GET /plants/pagination
 */
export function PlantsPaginationDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Danh sách Plants theo phân trang & lọc' }),

    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Trang muốn lấy (>= 1). Mặc định = 1.',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 50,
      description: 'Số bản ghi mỗi trang (1-100). Mặc định = 100.',
    }),
    ApiQuery({
      name: 'family',
      required: false,
      type: String,
      example: '6654bde219c3a01e4b51f9b7',
      description: 'ID của Family để lọc.',
    }),
    ApiQuery({
      name: 'attributes',
      required: false,
      type: String,
      example: '664faa1d0ec9f4ef7c4e94bf,664faa290ec9f4ef7c4e94c0',
      description: 'Danh sách Attribute ID, phân cách dấu phẩy.',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      example: 'rosa',
      description:
        'Tìm trong scientific_name hoặc common_name (không phân biệt hoa thường).',
    }),

    ApiOkResponse({
      description: 'Kết quả phân trang & lọc Plants',
      type: PaginatedPlantResponseDto,
    }),
  );
}
