import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
} from '@nestjs/common';
import { ContributesService } from './contribute.service';
import { CreateContributeDto } from './dto/create-contribute.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('contributes')
export class ContributesController {
  constructor(private readonly contributesService: ContributesService) {}

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'newImages', maxCount: 10 },
    ]),
  )
  async create(
    @Body() dto: CreateContributeDto,
    @UploadedFiles() files: { images?: any[]; newImages?: any[] },
    @Request() req,
  ) {
    // const userId = req.user.userId;
    // return this.contributesService.create(dto, files, userId);
    return {
      data: dto,
      request: req,
    }
  }

  @Get('/list')
  findAll() {
    return this.contributesService.findAll();
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string) {
    return this.contributesService.findOne(id);
  }

  @Patch('update/:id')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: 'pending' | 'approved' | 'rejected';
      reviewedBy: string;
      reviewMsg?: string;
    },
  ) {
    return this.contributesService.updateStatus(
      id,
      body.status,
      body.reviewedBy,
      body.reviewMsg,
    );
  }

  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.contributesService.delete(id);
  }
}
