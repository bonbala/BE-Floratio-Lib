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
import { MarksService } from './marks.service';
import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';

@Controller('marks')
@UseGuards(JwtAuthGuard)
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new mark for the authenticated user' })
  @ApiBody({
    description: 'Payload to create a mark',
    type: CreateMarkDto,
    examples: {
      example1: {
        summary: 'Mark a plant as favorite',
        value: {
          plant: '68235c12c5a4e8e70db0ea22',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mark created successfully',
    type: CreateMarkDto,
  })
  async create(@Request() req: any, @Body() dto: CreateMarkDto) {
    return this.marksService.create(req.user.userId, dto.plant);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Retrieve all marks for a given user' })
  @ApiParam({ name: 'userId', description: 'User identifier' })
  @ApiResponse({ status: 200, description: 'List of user marks' })
  findByUser(@Param('userId') userId: string) {
    return this.marksService.findByUser(userId);
  }

  @Get('list')
  @ApiOperation({ summary: 'Retrieve all marks' })
  @ApiResponse({ status: 200, description: 'List of all marks' })
  findAll() {
    return this.marksService.findAll();
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Retrieve a single mark by ID' })
  @ApiParam({ name: 'id', description: 'Mark identifier' })
  @ApiResponse({ status: 200, description: 'Mark details' })
  @ApiResponse({ status: 404, description: 'Mark not found' })
  findOne(@Param('id') id: string) {
    return this.marksService.findOne(id);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update an existing mark' })
  @ApiParam({ name: 'id', description: 'Mark identifier' })
  @ApiBody({
    description: 'Payload to update a mark',
    type: UpdateMarkDto,
    examples: {
      example1: {
        summary: 'Sample update payload',
        value: {
          plant: '68235c12c5a4e8e70db0ea22',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Mark updated successfully' })
  @ApiResponse({ status: 404, description: 'Mark not found' })
  update(@Param('id') id: string, @Body() dto: UpdateMarkDto) {
    return this.marksService.update(id, dto);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.marksService.remove(id);
  }
}
