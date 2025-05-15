import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

import { CreateContributeDto } from './dto/create-contribute.dto';
import { UpdateContributeDto } from './dto/update-contribute.dto';
import { ContributeService } from './contribute.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ContributeSummaryDto } from './dto/contribute-summary.dto';
import { ContributeResponseDto } from './dto/contribute-response.dto';

@Controller('contributes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContributeController {
  constructor(private readonly service: ContributeService) {}

  @Post('create')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Create a new contribution' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Payload to create a contribution (multipart/form-data)',
    schema: {
      type: 'object',
      properties: {
        scientific_name: { type: 'string' },
        common_name: {
          type: 'array',
          items: { type: 'string' },
        },
        description: { type: 'string' },
        attributes: {
          type: 'array',
          items: { type: 'string', description: 'Attribute ID' },
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        species_description: {
          type: 'array',
          items: { type: 'object' }, // or use a specific schema if available
        },
        suggested_family: { type: 'string', description: 'Family ID' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Contribution created',
    type: ContributeResponseDto,
  })
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(), // bắt buộc để có file.buffer
    }),
  ) // max 5 files
  async create(
    @Request() req: any,
    @Body() dto: CreateContributeDto,
    @UploadedFiles() files: any[],
  ) {
    return this.service.create(req.user.userId, dto, files);
  }

  @Get('list')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get all contributions' })
  @ApiResponse({
    status: 200,
    description: 'List of contributions',
    type: ContributeSummaryDto,
    isArray: true,
  })
  findAll() {
    return this.service.findAll();
  }

  @Get('detail/:id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get a specific contribution by ID' })
  @ApiParam({ name: 'id', description: 'Contribution ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Contribution details',
    type: ContributeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contribution not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('update/:id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Update a contribution' })
  @ApiParam({ name: 'id', description: 'Contribution ID', type: 'string' })
  @ApiBody({ type: UpdateContributeDto })
  @ApiResponse({
    status: 200,
    description: 'Contribution updated',
    type: ContributeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contribution not found' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateContributeDto,
  ) {
    return this.service.update(req.user.userId, req.user.role, id, dto);
  }

  @Delete('delete/:id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Delete a contribution' })
  @ApiParam({ name: 'id', description: 'Contribution ID' })
  @ApiResponse({ status: 204, description: 'Contribution deleted' })
  @ApiResponse({ status: 404, description: 'Contribution not found' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.userId, req.user.role, id);
  }
}
