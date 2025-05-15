// src/plants/plants.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Plant } from './schemas/plant.schema';
import { Family } from './schemas/family.schema';
import { Attribute } from './schemas/attribute.schema';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { File } from 'multer';

@Injectable()
export class PlantsService {
  constructor(
    @InjectModel(Plant.name) private plantModel: Model<Plant>,
    @InjectModel(Family.name) private famModel: Model<Family>,
    @InjectModel(Attribute.name) private attrModel: Model<Attribute>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(dto: CreatePlantDto, files?: File[]): Promise<Plant> {
    let familyDoc = await this.famModel.findOne({ name: dto.family });
    if (!familyDoc) familyDoc = await this.famModel.create({ name: dto.family });

    const attrDocs = await Promise.all(
      dto.attributes.map(async name => {
        let doc = await this.attrModel.findOne({ name });
        if (!doc) doc = await this.attrModel.create({ name });
        return doc;
      }),
    );

    const imageUrls: string[] = [];
    if (files && files.length) {
      for (const file of files) {
        const url: string = await this.cloudinary.uploadImage(file);
        imageUrls.push(url);
      }
    }

    const plant = new this.plantModel({
      scientific_name: dto.scientific_name,
      common_name: dto.common_name || [],
      family: familyDoc._id as Types.ObjectId,
      attributes: attrDocs.map(a => a._id as Types.ObjectId),
      images: imageUrls,
      species_description: dto.species_description || [],
    });
    return plant.save();
  }

  async findAll(): Promise<any[]> {
    const plants = await this.plantModel
      .find()
      .populate('family_name', 'name')
      .populate('attributes', 'name')
      .lean();

    return plants.map(p => ({
      scientific_name: p.scientific_name,
      common_name: p.common_name,
      family_name: (p.family_name as any)?.name,
      attributes: (p.attributes as any[]).map(a => a.name),
      images: p.images,
      species_description: p.species_description,
    }));
  }

  async findCompact(): Promise<Array<{
    scientific_name: string;
    family_name: string;
    image: string | null;         // chỉ image đầu tiên
    common_name: string[];
  }>> {
    const plants = await this.plantModel
      .find()
      .populate('family_name', 'name')
      .lean();

    return plants.map(p => ({
      scientific_name: p.scientific_name,
      family_name: (p.family_name as any)?.name,
      image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
      common_name: p.common_name,
    }));
  }

  async findOne(id: string): Promise<any> {
    const p = await this.plantModel
      .findById(id)
      .populate('family_name', 'name')
      .populate('attributes', 'name')
      .lean();
    if (!p) throw new NotFoundException('Plant not found');

    return {
      scientific_name: p.scientific_name,
      common_name: p.common_name,
      family_name: (p.family_name as any)?.name,
      attributes: (p.attributes as any[]).map(a => a.name),
      images: p.images,
      species_description: p.species_description,
    };
  }

  async update(id: string, dto: UpdatePlantDto): Promise<Plant> {
    const plant = await this.plantModel.findById(id);
    if (!plant) throw new NotFoundException('Plant not found');
    if (dto.family) {
      let fam = await this.famModel.findOne({ name: dto.family });
      if (!fam) fam = await this.famModel.create({ name: dto.family });
      plant.family_name = fam._id as Types.ObjectId;
    }
    if (dto.attributes) {
      const docs = await Promise.all(
        dto.attributes.map(async name => {
          let doc = await this.attrModel.findOne({ name });
          if (!doc) doc = await this.attrModel.create({ name });
          return doc as any;
        }),
      );
      plant.attributes = docs.map(d => d._id as Types.ObjectId);
    }
    Object.assign(plant, dto);
    return plant.save();
  }

  async remove(id: string): Promise<void> {
    const res = await this.plantModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Plant not found');
  }
}
