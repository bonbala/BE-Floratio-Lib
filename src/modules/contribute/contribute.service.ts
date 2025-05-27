import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Contribute,
  ContributeStatus,
  ContributeDocument,
} from './schemas/contribute.schema';
import { CreateContributeDto } from './dto/create-contribute.dto';
import { UpdateContributeDto } from './dto/update-contribute.dto';
import { ContributeResponseDto } from './dto/contribute-response.dto';
import { ContributeSummaryDto } from './dto/contribute-summary.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // import thêm
import { Express } from 'express';
@Injectable()
export class ContributeService {
  constructor(
    @InjectModel(Contribute.name)
    private contribModel: Model<ContributeDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    userId: string,
    dto: CreateContributeDto,
    files: any[] = [], // nhận files từ controller
  ): Promise<ContributeResponseDto> {
    // 1. Upload tất cả file lên Cloudinary
    const imageUrls: string[] = [];
    for (const file of files) {
      // file.buffer phải được cấu hình memoryStorage trong controller
      const url = await this.cloudinary.uploadImage(file.buffer);
      imageUrls.push(url);
    }

    // 2. Chuẩn bị data để lưu
    const data: Partial<Contribute> = {
      user: new Types.ObjectId(userId),
      scientific_name: dto.scientific_name,
      common_name: dto.common_name || [],
      description: dto.description,
      // DTO attributes gửi lên là array of attribute IDs
      attributes: dto.attributes?.map((id) => new Types.ObjectId(id)) || [],
      // images bây giờ là URL từ Cloudinary
      images: imageUrls,
      species_description: dto.species_description || [],
      suggested_family: dto.suggested_family
        ? new Types.ObjectId(dto.suggested_family)
        : undefined,
      status: ContributeStatus.pending,
      type: dto.type,
    };

    // 3. Lưu document và trả response qua ContributeResponseDto
    const created = await new this.contribModel(data).save();
    return this.toResponseDto(created);
  }

  /** helper để mapping document → DTO */
  private toResponseDto(item: ContributeDocument): ContributeResponseDto {
    const user = item.user as any;
    const reviewer = item.reviewed_by as any;
    return {
      _id: (item._id as Types.ObjectId).toString(),
      user: {
        _id: user._id.toString(),
        username: user.username,
      },
      scientific_name: item.scientific_name,
      common_name: item.common_name,
      description: item.description,
      attributes: (item.attributes as any[]).map((a) => a.name),
      images: item.images,
      species_description: item.species_description,
      suggested_family: item.suggested_family?.toString(),
      status: item.status,
      type: item.type,
      reviewed_by: reviewer
        ? {
            _id: reviewer._id.toString(),
            username: reviewer.username,
          }
        : undefined,
      review_message: item.review_message,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async findAll(): Promise<ContributeSummaryDto[]> {
    const items = await this.contribModel
      .find()
      .populate('user', 'username')
      .populate('attributes', 'name')
      .populate('reviewed_by', 'username')
      .exec();

    return items.map((item) => {
      const user = item.user as any;
      const reviewer = item.reviewed_by as any;

      // Đóng gói các thông tin plant liên quan vào contribute_plant
      const contribute_plant = {
        scientific_name: item.scientific_name,
        common_name: item.common_name,
        image:
          Array.isArray(item.images) && item.images.length > 0
            ? item.images[0]
            : undefined,
        description: item.description,
        attributes: (item.attributes as any[]).map((a) => a.name),
        // species_description: item.species_description, // nếu muốn
      };

      return {
        _id: (item._id as Types.ObjectId).toString(),
        user: {
          _id: user._id.toString(),
          username: user.username,
        },
        contribute_plant,
        reviewed_by: reviewer
          ? {
              _id: reviewer._id.toString(),
              username: reviewer.username,
            }
          : undefined,
        status: item.status,
        type: item.type,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
  }

  async findOne(id: string): Promise<ContributeResponseDto> {
    const item = await this.contribModel
      .findById(id)
      .populate('user', 'username')
      .populate('attributes', 'name')
      .populate('reviewed_by', 'username')
      .exec();

    if (!item) {
      throw new NotFoundException('Contribution not found');
    }

    return {
      _id: (item._id as Types.ObjectId).toString(),
      user: {
        _id:
          (item.user as any)._1d?.toString() ??
          (item.user as any)._id.toString(),
        username: (item.user as any).username,
      },
      scientific_name: item.scientific_name,
      common_name: item.common_name,
      description: item.description,
      attributes: (item.attributes as any[]).map((a) => a.name),
      images: item.images,
      species_description: item.species_description,
      suggested_family: item.suggested_family?.toString(),
      status: item.status,
      type: item.type,
      reviewed_by: item.reviewed_by
        ? {
            _id: (item.reviewed_by as any)._id.toString(),
            username: (item.reviewed_by as any).username,
          }
        : undefined,
      review_message: item.review_message,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async update(
    userId: string,
    role: string,
    id: string,
    dto: UpdateContributeDto,
  ): Promise<Contribute> {
    const item = await this.contribModel.findById(id).exec();
    if (!item) throw new NotFoundException('Contribution not found');

    if (dto.status) {
      if (role !== 'admin')
        throw new ForbiddenException('Only admins can change status');
      item.status = dto.status;
      item.reviewed_by = new Types.ObjectId(userId);
      if (dto.review_message) item.review_message = dto.review_message;
    }

    if (
      item.status === ContributeStatus.pending &&
      item.user.toString() === userId
    ) {
      item.scientific_name = dto.scientific_name ?? item.scientific_name;
      item.common_name = dto.common_name ?? item.common_name;
      item.description = dto.description ?? item.description;
      item.attributes =
        dto.attributes?.map((id) => new Types.ObjectId(id)) ?? item.attributes;
      item.images = dto.images ?? item.images;
      item.species_description =
        dto.species_description ?? item.species_description;
      item.suggested_family = dto.suggested_family
        ? new Types.ObjectId(dto.suggested_family)
        : item.suggested_family;
    }

    return item.save();
  }

  async remove(
    userId: string,
    role: string,
    id: string,
  ): Promise<{ deleted: boolean }> {
    const item = await this.contribModel.findById(id).exec();
    if (!item) throw new NotFoundException('Contribution not found');
    if (item.user.toString() !== userId && role !== 'admin')
      throw new ForbiddenException('Not allowed to delete');
    await this.contribModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
