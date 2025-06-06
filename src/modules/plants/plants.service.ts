// src/plants/plants.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Plant } from './schemas/plant.schema';
import { Family } from './schemas/family.schema';
import { Attribute } from './schemas/attribute.schema';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
// import { File } from 'multer';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { PlantListQueryDto } from './dto/plant-list-query.dto';
import { PlantStatsResponseDto } from './dto/plant-stats.dto';
import { HistoryService } from '../history/history.service';
import { toObjectId } from 'src/common/utils/to-object-id';
// import { Express } from 'express';

@Injectable()
export class PlantsService {
  constructor(
    @InjectModel(Plant.name) private plantModel: Model<Plant>,
    @InjectModel(Family.name) private famModel: Model<Family>,
    @InjectModel(Attribute.name) private attrModel: Model<Attribute>,
    private readonly cloudinary: CloudinaryService,
    private readonly historyService: HistoryService,
  ) {}

  async create(
    dto: CreatePlantDto,
    files?: Express.Multer.File[],
  ): Promise<Plant> {
    // 1. Ép family (string hoặc ObjectId) thành Types.ObjectId
    const familyId = toObjectId(dto.family);

    // 2. Ép từng attribute thành Types.ObjectId
    const attributeIds = Array.isArray(dto.attributes)
      ? dto.attributes.map((attr) => toObjectId(attr))
      : [];

    // 3. Upload ảnh nếu có
    const imageUrls: string[] = [];
    if (files && files.length) {
      for (const file of files) {
        const url: string = await this.cloudinary.uploadImage(
          file.buffer,
          'plants',
        );
        imageUrls.push(url);
      }
    }

    // Tạo document Plant mới,
    const plant = new this.plantModel({
      scientific_name: dto.scientific_name,
      common_name: dto.common_name || [],
      family: familyId as Types.ObjectId,
      attributes: attributeIds as Types.ObjectId[],
      images: imageUrls,
      species_description: dto.species_description || [],
    });
    return plant.save();
  }

  async findAll(): Promise<any[]> {
    const plants = await this.plantModel
      .find()
      .populate('family', 'name')
      .populate('attributes', 'name')
      .lean();

    return plants.map((p) => ({
      scientific_name: p.scientific_name,
      common_name: p.common_name,
      family: (p.family as any)?.name,
      attributes: (p.attributes as any[]).map((a) => a.name),
      images: p.images,
      species_description: p.species_description,
    }));
  }

  async findCompact(): Promise<
    Array<{
      _id: string;
      scientific_name: string;
      family: string;
      image: string | null; // chỉ image đầu tiên
      common_name: string[];
      attributes: string[];
      createdAt: string; // ISO-8601 string
      updatedAt: string; // ISO-8601 string
    }>
  > {
    // Chỉ lấy các trường cần thiết để giảm payload
    const plants = await this.plantModel
      .find()
      .select(
        'scientific_name family images common_name attributes createdAt updatedAt',
      )
      .populate('family', 'name')
      .populate('attributes', 'name')
      .lean();

    return plants.map((p) => ({
      _id: (p._id as Types.ObjectId).toString(),
      scientific_name: p.scientific_name,
      family: (p.family as any)?.name ?? '',
      image:
        Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
      common_name: p.common_name,
      attributes: Array.isArray((p as any).attributes)
        ? (p as any).attributes.map((a: any) => a.name)
        : [],
      createdAt: (p.createdAt as Date).toISOString(),
      updatedAt: (p.updatedAt as Date).toISOString(),
    }));
  }

  /** Lấy danh sách plants theo phân trang, tối đa 100 bản ghi mỗi trang */
  async findPaginated(
    page = 1,
    limit = 100,
  ): Promise<{
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    data: {
      _id: string;
      scientific_name: string;
      family: string;
      image: string | null;
      common_name: string[];
      attributes: string[];
    }[];
  }> {
    // đảm bảo giới hạn tối đa 100
    const pageSize = Math.min(limit, 100);
    const skip = (page - 1) * pageSize;

    const [plants, totalItems] = await Promise.all([
      this.plantModel
        .find()
        .skip(skip)
        .limit(pageSize)
        .populate('family', 'name')
        .populate('attributes', 'name')
        .lean(),
      this.plantModel.countDocuments(),
    ]);

    const data = plants.map((p) => ({
      _id: (p._id as Types.ObjectId).toString(),
      scientific_name: p.scientific_name,
      family: (p.family as any)?.name,
      image:
        Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
      common_name: p.common_name,
      attributes: Array.isArray((p as any).attributes)
        ? (p as any).attributes.map((a: any) => a.name)
        : [],
    }));

    return {
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      data,
    };
  }

  async findOne(id: string): Promise<any> {
    const p = await this.plantModel
      .findById(id)
      .populate('family', 'name')
      .populate('attributes', 'name')
      .lean();
    if (!p) throw new NotFoundException('Plant not found');

    return {
      scientific_name: p.scientific_name,
      common_name: p.common_name,
      family: (p.family as any)?.name,
      attributes: (p.attributes as any[]).map((a) => a.name),
      images: p.images,
      species_description: p.species_description,
    };
  }

  async update(
    id: string,
    dto: UpdatePlantDto, // family?: string, attributes?: string[]
    userId: string,
    contributeBy?: string,
    newImages?: Express.Multer.File[],
  ): Promise<Plant> {
    /* 1. Lấy bản ghi cũ */
    const plant = await this.plantModel.findById(id);
    if (!plant) throw new NotFoundException('Plant not found');

    const beforeSnapshot = plant.toObject();

    /* 2. Cập nhật các field đơn giản (trừ family & attributes) */
    const { family, attributes, ...rest } = dto;
    Object.assign(plant, rest);

    /* 3. Gán thẳng ObjectId cho family/attributes (đã có sẵn trong DB) */
    if (family) {
      plant.family = new Types.ObjectId(family);
    }

    if (attributes) {
      plant.attributes = attributes.map((attId) => new Types.ObjectId(attId));
    }

    /* 4. Upload ảnh mới (nếu có) */
    if (newImages?.length) {
      const uploaded: string[] = [];
      for (const file of newImages) {
        uploaded.push(await this.cloudinary.uploadImage(file.buffer, 'plants'));
      }
      plant.images.push(...uploaded); // nối thêm, không ghi đè
    }

    /* 5. Lưu thay đổi và ghi lịch sử */
    const updated = await plant.save();

    await this.historyService.createOnUpdate(
      id,
      beforeSnapshot,
      userId, // admin/mod cập nhật
      contributeBy, // có thể undefined
    );

    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const plant = await this.plantModel.findById(id);
    if (!plant) throw new NotFoundException('Plant not found');

    const beforeSnapshot = plant.toObject();

    await this.plantModel.findByIdAndDelete(id);
    await this.historyService.createOnDelete(id, beforeSnapshot, userId);
  }

  /** Lấy danh sách tất cả attributes */
  async findAllAttributes(): Promise<Attribute[]> {
    return this.attrModel.find().exec();
  }

  // --- Family CRUD methods ---
  async createFamily(dto: CreateFamilyDto): Promise<Family> {
    const exists = await this.famModel.findOne({ name: dto.name }).exec();
    if (exists) {
      throw new ConflictException(`Family name "${dto.name}" already exists`);
    }
    const fam = new this.famModel(dto);
    return fam.save();
  }

  async findAllFamilies(): Promise<Family[]> {
    return this.famModel.find().exec();
  }

  async findFamilyById(id: string): Promise<Family> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException(`Family id "${id}" invalid`);
    const fam = await this.famModel.findById(id).exec();
    if (!fam) throw new NotFoundException(`Family "${id}" not found`);
    return fam;
  }

  async updateFamily(id: string, dto: UpdateFamilyDto): Promise<Family> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException(`Family id "${id}" invalid`);
    // check exists
    const fam = await this.famModel.findById(id).exec();
    if (!fam) throw new NotFoundException(`Family with id "${id}" not found`);
    // if changing name, ensure unique
    if (dto.name && dto.name !== fam.name) {
      const dup = await this.famModel.findOne({ name: dto.name }).exec();
      if (dup) {
        throw new ConflictException(`Family name "${dto.name}" already exists`);
      }
    }
    Object.assign(fam, dto);
    return fam.save();
  }

  async deleteFamily(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException(`Family id "${id}" invalid`);
    const res = await this.famModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Family with id "${id}" not found`);
  }

  // Service Filter và Phân trang Plants List
  async findFiltered(queryDto: PlantListQueryDto) {
    const { page, limit, family, attributes, search } = queryDto;

    const pageSize = Math.min(limit ?? 100, 100);
    const skip = ((page ?? 1) - 1) * pageSize;

    /* ---------- xây query động ---------- */
    const filter: FilterQuery<Plant> = {};

    if (family) {
      filter.family = new Types.ObjectId(family);
    }

    if (attributes?.length) {
      filter.attributes = {
        $all: attributes.map((id) => new Types.ObjectId(id)),
      };
    }

    if (search) {
      const regex = new RegExp(search, 'i'); // bỏ qua hoa/thường
      filter.$or = [
        { scientific_name: regex },
        { common_name: regex }, // ← đã sửa
      ];
    }

    /* ---------- thực thi ---------- */
    const [plants, totalItems] = await Promise.all([
      this.plantModel
        .find(filter, {
          scientific_name: 1,
          common_name: 1,
          family: 1,
          images: { $slice: 1 },
          attributes: 1,
        })
        .skip(skip)
        .limit(pageSize)
        .populate('family', 'name')
        .populate('attributes', 'name')
        .lean(),
      this.plantModel.countDocuments(filter),
    ]);

    const data = plants.map((p) => ({
      _id: p._id.toString(),
      scientific_name: p.scientific_name,
      family: (p.family as any)?.name,
      image: p.images?.[0] ?? null,
      common_name: p.common_name,
      attributes: Array.isArray(p.attributes)
        ? (p.attributes as any[]).map((a) => a.name)
        : [],
    }));

    return {
      page: page ?? 1,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      data,
    };
  }

  // Service Stats tổng hợp số lượng loài từng họ
  async getFamilyStats(): Promise<PlantStatsResponseDto> {
    /* ---------- tổng số cây ---------- */
    const totalPlants = await this.plantModel.countDocuments();

    /* ---------- thống kê theo họ ---------- */
    const agg = await this.plantModel.aggregate([
      { $group: { _id: '$family', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'families',
          localField: '_id',
          foreignField: '_id',
          as: 'family',
        },
      },
      { $unwind: '$family' },
      {
        $project: {
          _id: 0,
          family_id: { $toString: '$_id' },
          family: '$family.name',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    return { totalPlants, families: agg };
  }
}
