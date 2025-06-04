// src/modules/plants/docs/create-plant.swagger.ts
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreatePlantDto } from '../dto/create-plant.dto';

export function SwaggerCreatePlant() {
  return applyDecorators(
    ApiOperation({ summary: 'Tạo mới cây (multipart/form-data)' }),

    // endpoint nhận multipart/form-data
    ApiConsumes('multipart/form-data'),

    // định nghĩa form-data schema
    ApiBody({
      required: true,
      description: 'Payload gửi dưới dạng multipart/form-data',
      schema: {
        type: 'object',
        properties: {
          scientific_name: { type: 'string', example: 'Abelia × grandiflora' },
          family_name: { type: 'string', example: 'Caprifoliaceae' },

          common_name: {
            type: 'array',
            items: { type: 'string' },
            example: ['Glossy abelia'],
          },
          attributes: {
            type: 'array',
            items: { type: 'string' },
            example: ['Full Sun', 'Moderate Water'],
          },

          species_description: {
            type: 'string',
            description: 'Chuỗi JSON của section/detail',
            example:
              '[{"section":"Biogeography","details":[{"label":"Native Distribution","content":"Mexico"}]}]',
          },

          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary', // Swagger hiện ô upload file
            },
            description: 'Tối đa 5 ảnh',
          },
        },
      },
    }),

    ApiResponse({
      status: 201,
      description: 'Plant created successfully',
      type: CreatePlantDto,
    }),
  );
}
