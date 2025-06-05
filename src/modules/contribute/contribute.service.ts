import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contribute } from './schemas/contribute.schema';
import { CreateContributeDto } from './dto/create-contribute.dto';
import { UpdateContributeDto } from './dto/update-contribute.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PlantsService } from '../plants/plants.service';
import { UpdatePlantDto } from '../plants/dto/update-plant.dto';
import { toObjectId } from 'src/common/utils/to-object-id';
import {
  mapToCreatePlantDto,
  mapToUpdatePlantDto,
} from 'src/common/utils/contribute-map';
import { Family } from '../plants/schemas/family.schema';
import { Attribute } from '../plants/schemas/attribute.schema';

type UploadedFilesType = {
  images?: Express.Multer.File[];
  new_images?: Express.Multer.File[];
};

type UpdateStatusContributeInput = {
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string;
  reviewMsg?: string;
};

@Injectable()
export class ContributesService {
  constructor(
    @InjectModel(Family.name) private famModel: Model<Family>,
    @InjectModel(Attribute.name) private attrModel: Model<Attribute>,
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
    files: UploadedFilesType,
    userId: string,
  ) {
    /* ---------- 1. Upload ảnh nếu có ---------- */
    const folder = 'plants';

    // 1.1 Ảnh gốc nằm trong data.plant.images
    if (files?.images?.length) {
      const uploadedUrls = await Promise.all(
        files.images.map((f) =>
          this.cloudinaryService.uploadImage(f.buffer, folder),
        ),
      );
      dto.data.plant.images = [
        ...(dto.data.plant.images ?? []),
        ...uploadedUrls,
      ];
    }

    // 1.2 Ảnh mới (new_images) tách riêng
    if (files?.new_images?.length) {
      const uploadedUrls = await Promise.all(
        files.new_images.map((f) =>
          this.cloudinaryService.uploadImage(f.buffer, folder),
        ),
      );
      dto.data.new_images = [...(dto.data.new_images ?? []), ...uploadedUrls];
    }

    /* ---------- 2. Ép kiểu ObjectId ---------- */
    dto.data.plant.family = toObjectId(dto.data.plant.family);

    if (Array.isArray(dto.data.plant.attributes)) {
      dto.data.plant.attributes = dto.data.plant.attributes.map(
        toObjectId,
      ) as Types.ObjectId[];
    }

    dto.data.plant_ref = toObjectId(dto.data.plant_ref);

    /* ---------- 3. Lưu Contribute document ---------- */
    const contribute = new this.contributeModel({
      c_user: new Types.ObjectId(userId),
      type: dto.type,
      status: 'pending', // luôn pending khi mới tạo
      c_message: dto.c_message,
      data: {
        plant_ref: dto.data.plant_ref, // chỉ có khi type = 'update'
        plant: dto.data.plant,
        new_images: dto.data.new_images ?? [],
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
        select: 'name', // Lấy mỗi name (& _id nếu cần)
        transform: (doc: any) => doc?.name,
      })
      // 👉 populate tên family
      .populate({
        path: 'data.plant.family',
        model: 'Family',
        select: 'name',
        transform: (doc: any) => doc?.name,
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
      data: item.data,
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
        select: 'name',
        transform: (doc: any) => doc?.name,
      })
      .populate({
        path: 'data.plant.family',
        model: 'Family',
        select: 'name',
        transform: (doc: any) => doc?.name,
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
      data: item.data,
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

  async update(
    id: string,
    dto: UpdateContributeDto | any,
    files: UploadedFilesType,
    userId: string,
  ) {
    /* 0. Parse JSON nếu client gửi data dưới dạng chuỗi */
    if (typeof dto.data === 'string') {
      try {
        dto.data = JSON.parse(dto.data);
      } catch {
        throw new BadRequestException('data phải là JSON hợp lệ');
      }
    }

    const contribute = await this.contributeModel.findById(id);
    if (!contribute) throw new NotFoundException('Not found');
    if (contribute.c_user.toString() !== userId) throw new ForbiddenException();
    if (contribute.status !== 'pending')
      throw new BadRequestException('Chỉ sửa khi pending');

    /* 1. Upload file */
    const folder = 'plants';
    if (files?.images?.length) {
      const urls = await Promise.all(
        files.images.map((f) =>
          this.cloudinaryService.uploadImage(f.buffer, folder),
        ),
      );
      contribute.data.plant.images = [
        ...(contribute.data.plant.images ?? []),
        ...urls,
      ];
    }
    if (files?.new_images?.length) {
      const urls = await Promise.all(
        files.new_images.map((f) =>
          this.cloudinaryService.uploadImage(f.buffer, folder),
        ),
      );
      contribute.data.new_images = [
        ...(contribute.data.new_images ?? []),
        ...urls,
      ];
    }

    /* 2. Ghép patch an toàn */
    if (dto.c_message !== undefined) contribute.c_message = dto.c_message;

    if (dto.data?.plant) {
      const patch = { ...dto.data.plant };

      /* ép ObjectId nếu có */
      if (patch.family) patch.family = toObjectId(patch.family) as any;
      if (patch.attributes)
        patch.attributes = patch.attributes.map(toObjectId) as any;

      /* 👉 Không ghi đè images khi patch.images trống/undefined */
      if (patch.images == null || patch.images.length === 0)
        delete patch.images;

      Object.assign(contribute.data.plant, patch);
    }

    if (dto.data?.new_images) {
      // ghi đè hoàn toàn nếu client gửi new_images
      contribute.data.new_images = dto.data.new_images;
    }

    await contribute.save();
    return contribute.toObject();
  }

  /** admin approve / reject */
  async moderate(
    id: string,
    action: 'approve' | 'reject',
    reviewMessage: string,
    adminId: string,
  ) {
    // Tìm contribute có tồn tại không
    const contrib = await this.contributeModel.findById(id);
    if (!contrib) throw new NotFoundException('Contribute not found');
    if (contrib.status !== 'pending')
      throw new BadRequestException('Chỉ duyệt khi trạng thái pending');

    /* gán reviewer info */
    contrib.reviewed_by = new Types.ObjectId(adminId);
    contrib.review_message = reviewMessage;

    /* ----- Xử lý reject ----- */
    if (action === 'reject') {
      contrib.status = 'rejected';
      await contrib.save();
      return { status: 'rejected' };
    }

    /* ----- Xử lý approve ----- */
    if (contrib.type === 'create') {
      // 1. map DTO & resolve family/attributes name (ObjectId -> name nếu cần)
      const dto = mapToCreatePlantDto(
        await this.resolveNames(contrib.data.plant),
      );

      // 2. Tạo plant mới
      const plant = await this.plantsService.create(dto);

      // 3. Cập nhật contribute
      contrib.status = 'approved';
      contrib.data.plant_ref = plant._id as Types.ObjectId; // lưu ref để tra cứu
    } else {
      // ---- type = update ----
      if (!contrib.data.plant_ref)
        throw new BadRequestException('Thiếu plant_ref');

      // 1. map DTO
      const dto = mapToUpdatePlantDto(
        await this.resolveNames(contrib.data.plant),
      );

      // 2. truyền new_images (array URL) sang PlantService.update
      await this.plantsService.update(
        contrib.data.plant_ref.toString(),
        dto,
        adminId,
        contrib.c_user.toString(), // contributeBy
        undefined, // newImages (URLs đã có sẵn)
      );

      contrib.status = 'approved';
    }

    await contrib.save();
    return { status: 'approved' };
  }

  /** chuyển ObjectId -> name (nếu contribute lưu id) để khớp PlantService hiện tại */
  private async resolveNames(rawPlant: any) {
    const clone = { ...rawPlant };

    // resolve family
    if (clone.family && clone.family instanceof Types.ObjectId) {
      const fam = await this.famModel.findById(clone.family).lean();
      if (fam) clone.family = fam.name;
    }

    // resolve attributes
    if (Array.isArray(clone.attributes)) {
      clone.attributes = await Promise.all(
        clone.attributes.map(async (attr: any) => {
          if (attr instanceof Types.ObjectId) {
            const doc = await this.attrModel.findById(attr).lean();
            return doc?.name ?? attr.toString();
          }
          return attr;
        }),
      );
    }

    return clone;
  }

  async delete(id: string) {
    return this.contributeModel.findByIdAndDelete(id);
  }
}
