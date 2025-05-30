// src/history/history.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@ApiTags('history')
@Controller('history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Tạo mới history' })
  @ApiBody({ type: CreateHistoryDto })
  create(@Body() dto: CreateHistoryDto) {
    return this.historyService.create(dto);
  }

  @Get('/list')
  @ApiOperation({ summary: 'Lấy danh sách history (có phân trang & filter)' })
  @ApiResponse({ status: 200, description: 'Danh sách history' })
  findAll(@Query() query: HistoryQueryDto) {
    return this.historyService.findAll(query);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: 'Lấy chi tiết history theo ID' })
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(id);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Cập nhật một history' })
  update(@Param('id') id: string, @Body() dto: UpdateHistoryDto) {
    return this.historyService.update(id, dto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Xóa một history' })
  remove(@Param('id') id: string) {
    return this.historyService.remove(id);
  }
}
