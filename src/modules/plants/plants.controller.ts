// src/plants/plants.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { PlantResponseDto } from './dto/plant-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Permissions } from 'src/common/decoraters/permissions.decorator';

@ApiTags('plants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  @Permissions('create:plant')
  @ApiOperation({ summary: 'Tạo mới cây' })
  @ApiResponse({
    status: 201,
    description: 'Tạo cây thành công.',
    type: PlantResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async create(
    @Body() createPlantDto: CreatePlantDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ): Promise<PlantResponseDto> {
    const plant = await this.plantsService.create(
      createPlantDto,
      files.images || [],
    );
    return this.toResponse(plant);
  }

  @Get()
  @Permissions('read:plant')
  @ApiOperation({ summary: 'Lấy danh sách tất cả cây' })
  @ApiResponse({
    status: 200,
    description: 'Trả về mảng cây.',
    type: [PlantResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(): Promise<PlantResponseDto[]> {
    const plants = await this.plantsService.findAll();
    return plants.map((p) => this.toResponse(p));
  }

  @Get(':id')
  @Permissions('read:plant')
  @ApiOperation({ summary: 'Lấy thông tin cây theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của cây' })
  @ApiResponse({
    status: 200,
    description: 'Trả về thông tin cây.',
    type: PlantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cây.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findOne(@Param('id') id: string): Promise<PlantResponseDto> {
    try {
      const plant = await this.plantsService.findOne(id);
      return this.toResponse(plant);
    } catch (err) {
      throw new HttpException(`Plant #${id} không tồn tại`, 404);
    }
  }

  @Patch(':id')
  @Permissions('update:plant')
  @ApiOperation({ summary: 'Cập nhật thông tin cây' })
  @ApiParam({ name: 'id', description: 'ObjectId của cây' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công.',
    type: PlantResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cây.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async update(
    @Param('id') id: string,
    @Body() updatePlantDto: UpdatePlantDto,
  ): Promise<PlantResponseDto> {
    try {
      const plant = await this.plantsService.update(id, updatePlantDto);
      return this.toResponse(plant);
    } catch (err) {
      throw new HttpException(`Plant #${id} không tồn tại`, 404);
    }
  }

  @Delete(':id')
  @Permissions('delete:plant')
  @ApiOperation({ summary: 'Xóa cây theo ID' })
  @ApiParam({ name: 'id', description: 'ObjectId của cây' })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công. Không trả về nội dung.',
  })
  @ApiResponse({ status: 400, description: 'Invalid ID.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cây.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.plantsService.remove(id);
    } catch (err) {
      throw new HttpException(`Plant #${id} không tồn tại`, 404);
    }
  }

  private toResponse(plant: any): PlantResponseDto {
    return {
      scientific_name: plant.scientific_name,
      common_name: plant.common_name,
      image_url: plant.image_url,
      info_sections: plant.info_sections.map((sec) => ({
        section_name: sec.section_name,
        details: sec.details.map((d) => ({
          category: d.category,
          content: d.content,
        })),
      })),
      phylum: plant.phylum.name,
      family: plant.family.name,
      attributes: plant.attributes.map((attr) => attr.name),
    };
  }
}
