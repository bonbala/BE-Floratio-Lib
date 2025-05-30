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
    files: { images?: any[]; newImages?: any[] },
    userId: string,
  ) {
    const images = files.images
      ? await this.uploadFiles(files.images, 'contribute')
      : [];
    const newImages = files.newImages
      ? await this.uploadFiles(files.newImages, 'contribute')
      : [];

    const contribute = new this.contributeModel({
      ...dto,
      images,
      newImages,
      c_user: userId,
    });
    return contribute.save();
  }

  async findAll() {
    const contributes = await this.contributeModel
      .find()
      .populate('c_user', 'username _id')
      .populate('reviewed_by', 'username _id')
      .lean();

    return contributes.map((item) => {
      let plantData;
      let newImages;

      // Nếu là dạng mới (có data.contribute_plant)
      if (item.data?.contribute_plant) {
        plantData = item.data.contribute_plant;
        newImages = item.data?.newImages || [];
      } else {
        // Nếu là dạng cũ (dữ liệu cây nằm ngoài)
        // Lấy tất cả field của item, trừ các field contribute
        // Có thể loại bỏ các trường liên quan đến contribute, chỉ giữ lại info của plant
        const {
          _id,
          c_user,
          type,
          status,
          reviewed_by,
          review_message,
          data,
          __v,
          createdAt,
          updatedAt, // Các field contribute
          ...plant
        } = item;

        plantData = plant;
        newImages = [];
      }

      return {
        _id: item._id,
        c_user: item.c_user,
        c_message: item.c_message,
        type: item.type,
        status: item.status,
        reviewed_by: item.reviewed_by || undefined,
        review_message: item.review_message || undefined,
        data: {
          plant: plantData,
          newImages,
        },
      };
    });
  }

  async findOne(id: string) {
    const item = await this.contributeModel
      .findById(id)
      .populate('c_user', 'username _id')
      .populate('reviewed_by', 'username _id')
      .lean();

    if (!item) return null;

    let plantData;
    let newImages;

    if (item.data?.contribute_plant) {
      plantData = item.data.contribute_plant;
      newImages = item.data?.newImages || [];
    } else {
      const {
        _id,
        c_user,
        type,
        status,
        reviewed_by,
        review_message,
        data,
        __v,
        ...plant
      } = item;

      plantData = plant;
      newImages = [];
    }

    return {
      _id: item._id,
      c_user: item.c_user,
      c_message: item.c_message,
      type: item.type,
      status: item.status,
      reviewed_by: item.reviewed_by || undefined,
      review_message: item.review_message || undefined,
      data: {
        plant: plantData,
        newImages,
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
    // Lấy plantId (sửa lại đúng field)
    const plantId =
      (contribute as any).plant_id ||
      ((contribute as any).plant && (contribute as any).plant._id) ||
      ((contribute as any).contribute_plant && (contribute as any).contribute_plant._id);

    if (!plantId) throw new NotFoundException('PlantId not found in contribute');

    // Merge images
    const mergedImages = [
      ...((contribute as any).images || []),
      ...((contribute as any).newImages || []),
    ];

    // Tạo payload update plant (lấy field nào thực sự có)
    const updatePlantDto = {
      ...((contribute as any).contribute_plant || {}),
      images: mergedImages,
    };

    // Gọi đúng hàm update plant
    await this.plantsService.update(
      plantId,
      updatePlantDto,
      reviewedBy,
      (contribute as any).c_user // Người đóng góp
    );
  }

  // Update lại contribute status
  return this.contributeModel.findByIdAndUpdate(
    id,
    {
      status,
      reviewed_by: reviewedBy,
      review_message: reviewMsg,
    },
    { new: true }
  );
}


  async delete(id: string) {
    return this.contributeModel.findByIdAndDelete(id);
  }
}
