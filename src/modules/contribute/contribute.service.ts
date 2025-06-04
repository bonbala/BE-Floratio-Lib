import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contribute } from './schemas/contribute.schema';
import { CreateContributeDto } from './dto/create-contribute.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PlantsService } from '../plants/plants.service';
import { UpdatePlantDto } from '../plants/dto/update-plant.dto';

// src/types/upload-file.type.ts
export type UploadFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  // nếu cần có thêm field Multer hỗ trợ thì bổ sung
};

type UpdateStatusContributeInput = {
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string;
  reviewMsg?: string;
};

// 🔸 helper: ép attributes & family về string
function normalizePlant(plant: any) {
  if (!plant) return {};

  const clone = { ...plant };

  // attributes → ["Thân bụi nhỏ", "Lá xanh bóng"]
  if (Array.isArray(clone.attributes)) {
    clone.attributes = clone.attributes.map((a: any) =>
      typeof a === 'object' && a !== null ? a.name : a,
    );
  }

  // family → "Caprifoliaceae"
  if (clone.family && typeof clone.family === 'object') {
    clone.family = clone.family.name;
  }

  return clone;
}

@Injectable()
export class ContributesService {
  constructor(
    @InjectModel(Contribute.name)
    private contributeModel: Model<Contribute>,
    private cloudinaryService: CloudinaryService,
    private readonly plantsService: PlantsService,
  ) {}

  private async uploadFiles(files: any[], folder: string): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const uploaded = await Promise.all(
      files.map((file) =>
        // file.buffer là buffer, truyền vào đúng hàm uploadImage
        this.cloudinaryService.uploadImage(file.buffer, folder),
      ),
    );
    return uploaded; // là mảng các link
  }

  async create(
    dto: CreateContributeDto,
    files: { images?: any[]; new_images?: any[] },
    userId: string,
  ) {
    /* Ảnh gốc của plant */
    const uploadedImages = files.images?.length
      ? await this.uploadFiles(files.images, 'contribute')
      : [];

    /* Ảnh “mới” */
    const uploadedNewImages = files.new_images?.length
      ? await this.uploadFiles(files.new_images, 'contribute')
      : [];

    /* ảnh newImages do client gửi qua body */
    const bodyNewImages = dto.new_images ?? [];

    /* payload plant kèm ảnh gốc */
    const plantPayload = {
      ...dto.plant,
      images: [...(dto.plant.images ?? []), ...uploadedImages],
    };

    const contribute = new this.contributeModel({
      type: dto.type,
      c_message: dto.c_message,
      c_user: userId,
      data: {
        plant: plantPayload,
        // gộp link newImages từ body + từ upload
        new_images: [...bodyNewImages, ...uploadedNewImages],
      },
    });

    return contribute.save();
  }

  async findAll() {
    const contributes = await this.contributeModel
      .find()
      .populate('c_user', 'username _id')
      .populate('reviewed_by', 'username _id')
      // 👉 populate tên attribute
      .populate({
        path: 'data.plant.attributes',
        model: 'Attribute', // Tên model
        select: 'name _id', // Lấy mỗi name (& _id nếu cần)
      })
      // 👉 populate tên family
      .populate({
        path: 'data.plant.family',
        model: 'Family',
        select: 'name _id',
      })
      .lean();

    return contributes.map((item) => ({
      _id: item._id,
      c_user: item.c_user,
      c_message: item.c_message,
      type: item.type,
      status: item.status,
      reviewed_by: item.reviewed_by ?? undefined,
      review_message: item.review_message ?? undefined,
      data: {
        plant: normalizePlant(item.data?.plant),
        new_images: item.data?.new_images ?? [],
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async findOne(id: string) {
    const item = await this.contributeModel
      .findById(id)
      .populate('c_user', 'username _id')
      .populate('reviewed_by', 'username _id')
      .populate({
        path: 'data.plant.attributes',
        model: 'Attribute',
        select: 'name _id',
      })
      .populate({
        path: 'data.plant.family',
        model: 'Family',
        select: 'name _id',
      })
      .lean();

    if (!item) return null;

    return {
      _id: item._id,
      c_user: item.c_user,
      c_message: item.c_message,
      type: item.type,
      status: item.status,
      reviewed_by: item.reviewed_by ?? undefined,
      review_message: item.review_message ?? undefined,
      data: {
        plant: normalizePlant(item.data?.plant),
        new_images: item.data?.new_images ?? [],
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    reviewedBy: string,
    reviewMsg?: string,
  ) {
    const contribute = await this.contributeModel.findById(id);
    if (!contribute) throw new NotFoundException('Contribute not found');

    if (status === 'approved') {
      // lấy thông tin plant trong data
      const plantData: any = (contribute as any).data?.plant;
      const plantId = plantData?._id?.toString();

      if (!plantId) {
        throw new NotFoundException('PlantId not found in contribute');
      }

      // gộp ảnh cũ + ảnh mới
      const mergedImages = [
        ...(plantData.images ?? []),
        ...((contribute as any).data?.newImages ?? []),
      ];

      const updatePlantDto: UpdatePlantDto = {
        ...plantData,
        images: mergedImages,
      };

      await this.plantsService.update(
        plantId,
        updatePlantDto,
        reviewedBy,
        (contribute as any).c_user, // người đóng góp
      );
    }

    // cập nhật trạng thái contribute
    return this.contributeModel.findByIdAndUpdate(
      id,
      {
        status,
        reviewed_by: reviewedBy,
        review_message: reviewMsg,
      },
      { new: true },
    );
  }

  async delete(id: string) {
    return this.contributeModel.findByIdAndDelete(id);
  }
}
