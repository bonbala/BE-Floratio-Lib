import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly clodudinarySerivce: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: multer.memoryStorage(), // file.buffer sẵn dùng
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB (tuỳ chỉnh)
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file received');
    }

    // tuỳ chọn: truyền folder riêng, VD 'plants'
    const url = await this.clodudinarySerivce.uploadImage(
      file.buffer,
      'plants',
    );
    return { url };
  }
}
