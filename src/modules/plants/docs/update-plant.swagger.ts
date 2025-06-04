// src/modules/plants/docs/update-plant.swagger.ts
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdatePlantDto } from '../dto/update-plant.dto';

export function SwaggerUpdatePlant() {
  return applyDecorators(
    ApiOperation({ summary: 'Cập nhật cây (multipart/form-data)' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          /* các trường text cần update (tuỳ chọn) */
          family_name: { type: 'string', example: 'Caprifoliaceae' },
          attributes: {
            type: 'array',
            items: { type: 'string' },
            example: ['Full Sun', 'Moderate Water'],
          },
          species_description: {
            type: 'string',
            description: 'Chuỗi JSON (nếu có)',
            example:
              '[{"section":"Info","details":[{"label":"x","content":"y"}]}]',
          },
          /* upload ảnh mới */
          'new-images': {
            type: 'array',
            items: { type: 'string', format: 'binary' },
            description: 'Ảnh mới thêm cho plant',
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Plant updated successfully' }),
  );
}
