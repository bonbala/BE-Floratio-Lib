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
import { ContributeService } from './contribute.service';
import { CreateContributeDto } from './dto/create-contribute.dto';
import { UpdateContributeDto } from './dto/update-contribute.dto';

@Controller('contributes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContributeController {
  constructor(private readonly service: ContributeService) {}

  @Post()
  @Roles('user', 'admin')
  create(@Request() req: any, @Body() dto: CreateContributeDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  @Roles('user', 'admin')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('user', 'admin')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('user', 'admin')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateContributeDto,
  ) {
    return this.service.update(req.user.userId, req.user.role, id, dto);
  }

  @Delete(':id')
  @Roles('user', 'admin')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.userId, req.user.role, id);
  }
}
