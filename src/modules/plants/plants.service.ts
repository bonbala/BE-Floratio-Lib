import { Types } from 'mongoose';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Plant, PlantDocument } from 'src/schemas/Plants.schema';
import { Section } from 'src/schemas/InfoDetails.schema';
import { Detail } from 'src/schemas/Details.schema';
import { Phylum } from 'src/schemas/Phylum.schema';
import { Family } from 'src/schemas/Family.schema';
import { Attribute, AttributeDocument } from 'src/schemas/Attribute.schema';
import { CloudinaryService } from 'src/cloudinary/clodinary.service';

@Injectable()
export class PlantsService {
  constructor(
    @InjectModel(Plant.name) private plantModel: Model<PlantDocument>,
    @InjectModel(Phylum.name) private phylumModel: Model<Phylum>,
    @InjectModel(Family.name) private familyModel: Model<Family>,
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(Detail.name) private detailModel: Model<Detail>,
    @InjectModel(Attribute.name)
    private attributeModel: Model<AttributeDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Tạo mới cây và các Attributes nếu chưa tồn tại
   */
  async create(
    createPlantDto: CreatePlantDto,
    files: Express.Multer.File[],
  ): Promise<Plant> {
    try {
      // Upload ảnh lên Cloudinary
      const uploadResults = await Promise.all(
        files.map((file) => this.cloudinaryService.uploadImage(file)),
      );
      const imageUrls = uploadResults.map((result) => result.secure_url);

      // Tìm hoặc tạo Phylum
      let phylum = await this.phylumModel
        .findOne({ name: createPlantDto.phylum })
        .exec();
      if (!phylum) {
        phylum = await this.phylumModel.create({ name: createPlantDto.phylum });
      }

      // Tìm hoặc tạo Family
      let family = await this.familyModel
        .findOne({ name: createPlantDto.family })
        .exec();
      if (!family) {
        family = await this.familyModel.create({ name: createPlantDto.family });
      }

      // Tạo section + details
      const sectionIds: Types.ObjectId[] = [];
      for (const sectionDto of createPlantDto.info_sections || []) {
        const detailDocs = await this.detailModel.insertMany(
          sectionDto.details,
        );
        const detailIds = detailDocs.map((d) => d._id);

        const section = await this.sectionModel.create({
          section_name: sectionDto.section_name,
          details: detailIds,
        });

        sectionIds.push(section._id);
      }

      // Tìm hoặc tạo Attributes
      const attrNames: string[] = createPlantDto.attributes || [];
      const attrDocs: AttributeDocument[] = await Promise.all(
        attrNames.map(async (name) => {
          let attr = await this.attributeModel.findOne({ name }).exec();
          if (!attr) {
            attr = await this.attributeModel.create({ name });
          }
          return attr;
        }),
      );
      const attrIds: Types.ObjectId[] = attrDocs.map(
        (doc) => doc._id as Types.ObjectId,
      );

      // Tạo Plant
      const plant = new this.plantModel({
        scientific_name: createPlantDto.scientific_name,
        common_name: createPlantDto.common_name,
        image_url: imageUrls,
        info_sections: sectionIds,
        phylum: phylum._id,
        family: family._id,
        attributes: attrIds,
      });

      return await plant.save();
    } catch (err) {
      console.error('Create Plant Error:', err);
      throw err; // để Nest trả về 500 và bạn đọc log
    }
  }

  /**
   * Lấy danh sách tất cả cây, populated tất cả quan hệ
   */
  async findAll(): Promise<Plant[]> {
    return this.plantModel
      .find()
      .populate('info_sections')
      .populate({ path: 'info_sections', populate: { path: 'details' } })
      .populate('phylum')
      .populate('family')
      .populate('attributes')
      .exec();
  }

  /**
   * Lấy một cây theo id
   */
  async findOne(id: string): Promise<Plant> {
    const plant = await this.plantModel
      .findById(id)
      .populate('info_sections')
      .populate({ path: 'info_sections', populate: { path: 'details' } })
      .populate('phylum')
      .populate('family')
      .populate('attributes')
      .exec();
    if (!plant) throw new NotFoundException(`Plant #${id} không tồn tại`);
    return plant;
  }

  /**
   * Cập nhật cây và Attributes
   */
  async update(id: string, updatePlantDto: UpdatePlantDto): Promise<Plant> {
    const plant = await this.plantModel.findById(id).exec();
    if (!plant) throw new NotFoundException(`Plant #${id} không tồn tại`);

    // Xử lý Attributes nếu có
    if (Array.isArray(updatePlantDto.attributes)) {
      const attrDocs: AttributeDocument[] = await Promise.all(
        updatePlantDto.attributes.map(async (name) => {
          let attr = await this.attributeModel.findOne({ name }).exec();
          if (!attr) {
            attr = await this.attributeModel.create({ name });
          }
          return attr;
        }),
      );
      plant.attributes = attrDocs.map((doc) => doc._id as Types.ObjectId);
    }

    // Cập nhật các trường khác
    Object.assign(plant, updatePlantDto);
    return plant.save();
  }

  /**
   * Xoá cây theo id
   */
  async remove(id: string): Promise<void> {
    const result = await this.plantModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Plant #${id} không tồn tại`);
  }
}
