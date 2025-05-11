// src/plants/plants.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@ApiTags('plants')
@ApiBearerAuth()
@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới một cây' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        scientific_name: { type: 'string', example: 'Ficus lyrata' },
        common_name: { type: 'string', example: 'Fiddle Leaf Fig' },
        phylum: { type: 'string', example: 'Magnoliophyta' },
        family: { type: 'string', example: 'Moraceae' },
        info_sections: {
          type: 'array',
          items: { $ref: '#/components/schemas/CreateSectionDto' },
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Cây được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  create(
    @Body() createPlantDto: CreatePlantDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    return this.plantsService.create(createPlantDto, files.images || []);
  } // :contentReference[oaicite:8]{index=8}:contentReference[oaicite:9]{index=9}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả cây' })
  @ApiResponse({ status: 200, description: 'Trả về mảng cây.' })
  findAll() {
    return this.plantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin một cây theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của cây' })
  @ApiResponse({ status: 200, description: 'Trả về chi tiết cây.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cây.' })
  findOne(@Param('id') id: string) {
    return this.plantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật một cây theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của cây' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cây.' })
  update(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto) {
    return this.plantsService.update(id, updatePlantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một cây theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của cây' })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công. Không trả về nội dung.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cây.' })
  remove(@Param('id') id: string) {
    return this.plantsService.remove(id);
  }
}
