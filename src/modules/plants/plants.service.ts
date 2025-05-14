import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { File } from 'multer';
import { Plant } from './schemas/plant.schema';
import { Attribute } from './schemas/attribute.schema';
import { Family } from './schemas/family.schema';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PlantsService {
  constructor(
    @InjectModel(Plant.name) private plantModel: Model<Plant>,
    @InjectModel(Attribute.name) private attrModel: Model<Attribute>,
    @InjectModel(Family.name) private famModel: Model<Family>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(dto: CreatePlantDto, files?: File[]): Promise<Plant> {
    const attributeIds: Types.ObjectId[] = await Promise.all(
      dto.attributes.map(async (name) => {
        let attr = await this.attrModel.findOne({ name }).exec();
        if (!attr) attr = await this.attrModel.create({ name });
        return attr._id as Types.ObjectId;
      }),
    );

    let family = await this.famModel.findOne({ name: dto.family }).exec();
    if (!family) family = await this.famModel.create({ name: dto.family });

    let urls: string[] = [];
    if (files?.length) {
      urls = await Promise.all(
        files.map((f) => this.cloudinary.uploadImage(f.buffer, 'plants')),
      );
    }

    const created = new this.plantModel({
      common_name: dto.common_name,
      scientific_name: dto.scientific_name,
      description: dto.description,
      attributes: attributeIds,
      family: family._id as Types.ObjectId,
      images: urls,
      species_description: dto.species_description || [],
    });
    return created.save();
  }

  async findAll(): Promise<Plant[]> {
    return this.plantModel
      .find()
      .populate('attributes')
      .populate('family')
      .exec();
  }

  async findOne(id: string): Promise<Plant> {
    const plant = await this.plantModel
      .findById(id)
      .populate('attributes')
      .populate('family')
      .exec();
    if (!plant) throw new NotFoundException('Plant not found');
    return plant;
  }

  async update(
    id: string,
    dto: UpdatePlantDto,
    files?: File[],
  ): Promise<Plant> {
    const plant = await this.plantModel.findById(id).exec();
    if (!plant) throw new NotFoundException('Plant not found');

    if (dto.attributes) {
      const attrIds: Types.ObjectId[] = await Promise.all(
        dto.attributes.map(async (name) => {
          let attr = await this.attrModel.findOne({ name }).exec();
          if (!attr) attr = await this.attrModel.create({ name });
          return attr._id as Types.ObjectId;
        }),
      );
      plant.attributes = attrIds;
    }

    if (dto.family) {
      let fam = await this.famModel.findOne({ name: dto.family }).exec();
      if (!fam) fam = await this.famModel.create({ name: dto.family });
      plant.family = fam._id as Types.ObjectId;
    }

    let urls = plant.images || [];
    if (files?.length) {
      const newUrls = await Promise.all(
        files.map((f) => this.cloudinary.uploadImage(f.buffer, 'plants')),
      );
      urls = urls.concat(newUrls);
    }
    plant.images = urls;

    Object.assign(plant, {
      common_name: dto.common_name,
      scientific_name: dto.scientific_name,
      description: dto.description,
      species_description: dto.species_description,
    });

    return plant.save();
  }

  async remove(id: string) {
    const res = await this.plantModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Plant not found');
    return { deleted: true };
  }
}
