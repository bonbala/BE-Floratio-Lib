import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { PlantResponseDto } from './dto/plant-response.dto';
import { File } from 'multer';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new plant entry' })
  @ApiBody({
    description: 'Data needed to create a plant',
    type: CreatePlantDto,
    examples: {
      example1: {
        summary: 'Sample create payload',
        value: {
          scientific_name: 'Abelia × grandiflora',
          common_name: ['Glossy abelia'],
          family_name: 'Caprifoliaceae',
          attributes: ['Full Sun', 'Moderate Water'],
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Plant created successfully',
    type: CreatePlantDto,
  })
  @UseInterceptors(FilesInterceptor('images', 5))
  create(@Body() dto: CreatePlantDto, @UploadedFiles() files: File[]) {
    return this.plantsService.create(dto, files);
  }

  @Get('list')
  @ApiOperation({ summary: 'Retrieve all plants' })
  @ApiResponse({
    status: 200,
    description: 'List of plants',
    type: [PlantResponseDto],
  })
  findAll() {
    return this.plantsService.findCompact();
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Retrieve a single plant by ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the plant' })
  @ApiResponse({
    status: 200,
    description: 'Plant details',
    type: PlantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  findOne(@Param('id') id: string) {
    return this.plantsService.findOne(id);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update an existing plant' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the plant' })
  @ApiBody({
    type: UpdatePlantDto,
    examples: {
      example1: {
        summary: 'Sample update payload',
        value: {
          common_name: ['Glossy abelia', '大花六道木'],
          attributes: [
            'Full Sun',
            'Moderate Water',
            'Butterfly-Attracting Plant',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Plant updated successfully',
    type: PlantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePlantDto) {
    return this.plantsService.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Remove a plant by ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the plant' })
  @ApiResponse({ status: 204, description: 'Plant removed successfully' })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  remove(@Param('id') id: string) {
    return this.plantsService.remove(id);
  }
}
