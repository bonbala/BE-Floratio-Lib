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
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { PlantResponseDto } from './dto/plant-response.dto';
import { File } from 'multer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateFamilyDto } from './dto/create-family.dto';
import { Family } from './schemas/family.schema';
import { UpdateFamilyDto } from './dto/update-family.dto';
// import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PlantListQueryDto } from './dto/plant-list-query.dto';
import { PlantsPaginationDoc } from './docs/pagination.doc';
import { PlantStatsResponseDto } from './dto/plant-stats.dto';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
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

  @Get('pagination')
  @PlantsPaginationDoc()
  async listPaginated(@Query() query: PlantListQueryDto) {
    console.log('💬 queryDto.attributes =', query.attributes);
    return this.plantsService.findFiltered(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
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
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePlantDto,
  ) {
    const updated = await this.plantsService.update(id, dto, req.user.userId);
    return {
      message: 'Plant updated successfully',
      data: updated,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a plant by ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the plant' })
  @ApiResponse({ status: 204, description: 'Plant removed successfully' })
  @ApiResponse({ status: 404, description: 'Plant not found' })
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.plantsService.remove(id, req.user.userId);
    return {
      message: 'Plant removed successfully',
    };
  }

  @Get('attributes/list')
  @ApiOperation({ summary: 'Get list attributes' })
  async getAttributesList() {
    return this.plantsService.findAllAttributes();
  }

  // --- Family endpoints under /plants/families ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  @Post('families/create')
  @ApiOperation({ summary: 'Create family' })
  @ApiBody({ type: CreateFamilyDto })
  @ApiResponse({ status: 201, type: Family })
  createFamily(@Body() dto: CreateFamilyDto): Promise<Family> {
    return this.plantsService.createFamily(dto);
  }

  @Get('families/list')
  @ApiOperation({ summary: 'Get list families' })
  async getFamiliesList() {
    return this.plantsService.findAllFamilies();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  @Get('families/detail/:id')
  @ApiOperation({ summary: 'Get family by id' })
  @ApiParam({ name: 'id', description: 'Family ID' })
  @ApiResponse({ status: 200, type: Family })
  findFamily(@Param('id') id: string): Promise<Family> {
    return this.plantsService.findFamilyById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  @Patch('families/update/:id')
  @ApiOperation({ summary: 'Update family' })
  @ApiParam({ name: 'id', description: 'Family ID' })
  @ApiBody({ type: UpdateFamilyDto })
  @ApiResponse({ status: 200, type: Family })
  updateFamily(
    @Param('id') id: string,
    @Body() dto: UpdateFamilyDto,
  ): Promise<Family> {
    return this.plantsService.updateFamily(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  @Delete('families/delete/:id')
  @ApiOperation({ summary: 'Delete family' })
  @ApiParam({ name: 'id', description: 'Family ID' })
  @ApiResponse({ status: 204 })
  deleteFamily(@Param('id') id: string): Promise<void> {
    return this.plantsService.deleteFamily(id);
  }

  @Get('families/stats')
  @ApiOperation({ summary: 'Tổng số cây và số cây theo từng họ' })
  @ApiOkResponse({ type: PlantStatsResponseDto })
  async getFamilyStats() {
    return this.plantsService.getFamilyStats();
  }
}
