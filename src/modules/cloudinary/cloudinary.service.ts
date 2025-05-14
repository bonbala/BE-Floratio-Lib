import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinaryClient: typeof Cloudinary,
  ) {}

  /**
   * Upload ảnh lên Cloudinary.
   * @param fileBuffer Buffer của file (Sử dụng Multer memoryStorage hoặc fs)
   * @param folder Thư mục trên Cloudinary (tùy chọn)
   * @returns URL của ảnh đã upload
   */
  async uploadImage(fileBuffer: Buffer, folder?: string): Promise<string> {
    if (!fileBuffer) {
      throw new BadRequestException('File buffer is required');
    }
    // Chuyển buffer sang base64
    const base64 = fileBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;

    const result = await this.cloudinaryClient.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
    });
    return result.secure_url;
  }
}
