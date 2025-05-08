import { Types } from 'mongoose';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Plant, PlantDocument } from 'src/schemas/Plants.schema';
import { Section } from 'src/schemas/InfoDetails.schema';
import { Detail } from 'src/schemas/Details.schema';
import { Phylum } from 'src/schemas/Phylum.schema';
import { Family } from 'src/schemas/Family.schema';

@Injectable()
export class PlantsService {
  constructor(
    @InjectModel(Plant.name) private plantModel: Model<PlantDocument>,
    @InjectModel(Phylum.name) private phylumModel: Model<Phylum>,
    @InjectModel(Family.name) private familyModel: Model<Family>,
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectModel(Detail.name) private detailModel: Model<Detail>,
  ) {}

  async create(createPlantDto: CreatePlantDto) {
    // 1. Tìm hoặc tạo Phylum
    let phylum = await this.phylumModel.findOne({
      name: createPlantDto.phylum,
    });
    if (!phylum) {
      phylum = await this.phylumModel.create({ name: createPlantDto.phylum });
    }

    // 2. Tìm hoặc tạo Family
    let family = await this.familyModel.findOne({
      name: createPlantDto.family,
    });
    if (!family) {
      family = await this.familyModel.create({ name: createPlantDto.family });
    }

    // 3. Tạo detail và section
    const sectionIds: Types.ObjectId[] = [];
    for (const sectionDto of createPlantDto.info_sections) {
      const detailDocs = await this.detailModel.insertMany(sectionDto.details);
      const detailIds = detailDocs.map((d) => d._id);

      const section = await this.sectionModel.create({
        section_name: sectionDto.section_name,
        details: detailIds,
      });

      sectionIds.push(section._id);
    }

    // 4. Tạo plant
    const plant = new this.plantModel({
      scientific_name: createPlantDto.scientific_name,
      common_name: createPlantDto.common_name,
      image_url: createPlantDto.image_url,
      info_sections: sectionIds,
      phylum: phylum._id,
      family: family._id,
    });

    return plant.save();
  }

  findAll() {
    return this.plantModel
      .find()
      .populate('info_sections')
      .populate({
        path: 'info_sections',
        populate: { path: 'details' },
      })
      .populate('phylum')
      .populate('family');
  }

  findOne(id: string) {
    return this.plantModel
      .findById(id)
      .populate('info_sections')
      .populate({
        path: 'info_sections',
        populate: { path: 'details' },
      })
      .populate('phylum')
      .populate('family');
  }

  update(id: string, updatePlantDto: UpdatePlantDto) {
    return this.plantModel.findByIdAndUpdate(id, updatePlantDto, {
      new: true,
    });
  }

  remove(id: string) {
    return this.plantModel.findByIdAndDelete(id);
  }
}
