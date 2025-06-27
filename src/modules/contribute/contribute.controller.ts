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
  Query,
} from '@nestjs/common';
import { ContributesService } from './contribute.service';
import { CreateContributeDto } from './dto/create-contribute.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateContributeDto } from './dto/update-contribute.dto';
import { ContributeListQueryDto } from './dto/contribute-list-query.dto';

type UploadedFilesType = {
  images?: Express.Multer.File[];
  new_images?: Express.Multer.File[]; // field-name phải trùng form-data
};

@UseGuards(JwtAuthGuard)
@Controller('contributes')
export class ContributesController {
  constructor(private readonly contributesService: ContributesService) {}

  @Post('/create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'new_images', maxCount: 10 },
      ],
      {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB/ảnh tuỳ chỉnh
      },
    ),
  )
  create(
    @Body() dto: CreateContributeDto,
    @UploadedFiles() files: UploadedFilesType,
    @Request() req: any,
  ) {
    const userId: string = req.user.userId; // lấy từ JWT
    return this.contributesService.create(dto, files, userId);
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'images', maxCount: 10 },
        { name: 'new_images', maxCount: 10 },
      ],
      { limits: { fileSize: 5 * 1024 * 1024 } },
    ),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContributeDto,
    @UploadedFiles() files: UploadedFilesType,
    @Request() req: any,
  ) {
    return this.contributesService.update(id, dto, files, req.user.userId);
  }

  @Patch('moderate/:id') // assume admin
  async moderate(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; message: string },
    @Request() req: any,
  ) {
    return this.contributesService.moderate(
      id,
      body.action,
      body.message,
      req.user._id,
    );
    // const contrib = await this.contributesService.findById(id);
    // const userId = req.user.userId;
    // return {
    //   contrib,
    //   body,
    //   userId,
    // };
  }

  @Delete('delete/:id')
  delete(@Param('id') id: string) {
    return this.contributesService.delete(id);
  }
}
