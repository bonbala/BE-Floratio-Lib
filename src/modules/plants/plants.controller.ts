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
import { FilesInterceptor } from '@nestjs/platform-express';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { File } from 'multer';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  create(@Body() dto: CreatePlantDto, @UploadedFiles() files: File[]) {
    return this.plantsService.create(dto, files);
  }

  @Get()
  findAll() {
    return this.plantsService.findAll();
  }

  @Get('compact')
  getCompact() {
    return this.plantsService.findCompact();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlantDto) {
    return this.plantsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plantsService.remove(id);
  }
}