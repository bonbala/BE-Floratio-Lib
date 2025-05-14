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

  @Post()
  async create(@Request() req: any, @Body() dto: CreateMarkDto) {
    return this.marksService.create(req.user.userId, dto.plant);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.marksService.findByUser(userId);
  }

  @Get()
  findAll() {
    return this.marksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMarkDto) {
    return this.marksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.marksService.remove(id);
  }
}
