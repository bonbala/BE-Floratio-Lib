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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ContributeService } from './contribute.service';
import { CreateContributeDto } from './dto/create-contribute.dto';
import { UpdateContributeDto } from './dto/update-contribute.dto';

@Controller('contributes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContributeController {
  constructor(private readonly service: ContributeService) {}

  @Post('create')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Create a new contribution' })
  @ApiBody({
    description: 'Data to create a contribution',
    type: CreateContributeDto,
    examples: {
      example1: {
        summary: 'Sample contribution payload',
        value: {
          title: 'Thêm cảnh quan mới',
          content: 'Mô tả chi tiết về cảnh quan và thông tin thực vật.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Contribution created' })
  create(@Request() req: any, @Body() dto: CreateContributeDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get('list')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get all contributions' })
  @ApiResponse({ status: 200, description: 'List of contributions' })
  findAll() {
    return this.service.findAll();
  }

  @Get('detail/:id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Get a specific contribution by ID' })
  @ApiParam({ name: 'id', description: 'Contribution ID' })
  @ApiResponse({ status: 200, description: 'Contribution details' })
  @ApiResponse({ status: 404, description: 'Contribution not found' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('update/:id')
  @Roles('user', 'admin')
  @ApiOperation({ summary: 'Update a contribution' })
  @ApiParam({ name: 'id', description: 'Contribution ID' })
  @ApiBody({
    description: 'Data to update contribution',
    type: UpdateContributeDto,
    examples: {
      example1: {
        summary: 'Sample update payload',
        value: {
          title: 'Cập nhật cảnh quan',
          content: 'Nội dung mô tả mới về cảnh quan.',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Contribution updated' })
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
