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
  UsePipes,
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
import {
  CreatePlantDto,
  UpdatePlantDto,
  PlantResponseDto,
  CreateFamilyDto,
  UpdateFamilyDto,
  PlantListQueryDto,
  PlantStatsResponseDto,
  FindPlantsByNamesDto,
} from './dto/index';
// import { File } from 'multer';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Family } from './schemas/family.schema';
import {
  SwaggerCreatePlant,
  PlantsPaginationDoc,
  SwaggerUpdatePlant,
} from './docs';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  @Post('create')
  @SwaggerCreatePlant()
  @UseInterceptors(FilesInterceptor('images', 5))
  create(
    @Body() dto: CreatePlantDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.plantsService.create(dto, files);
    // return {
    //   dto,
    //   files,
    // };
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
  async listPaginated(@Query() query) {
    console.log('💬 queryDto.attributes =', query.attributes);
    return this.plantsService.findFiltered(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super-admin', 'admin')
  @Patch('update/:id')
  @HttpCode(HttpStatus.OK)
  @SwaggerUpdatePlant()
  @UseInterceptors(FilesInterceptor('new-images', 5))
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePlantDto,
    @UploadedFiles() newImages: Express.Multer.File[],
  ) {
    const updated = await this.plantsService.update(
      id,
      dto,
      req.user.userId,
      undefined, //tham số cho contributeBy (giữ nguyên tuỳ chọn)
      newImages,
    );
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

  @Post('find-by-names')
  findByNames(@Body() dto: FindPlantsByNamesDto) {
    return this.plantsService.findByScientificNames(dto);
  }
}
