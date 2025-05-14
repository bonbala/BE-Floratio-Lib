import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Mark } from './schemas/mark.schema';
// import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';
import { Plant } from '../plants/schemas/plant.schema';

@Injectable()
export class MarksService {
  constructor(
    @InjectModel(Mark.name) private markModel: Model<Mark>,
    @InjectModel(Plant.name) private plantModel: Model<Plant>,
  ) {}

  async create(userId: string, plantId: string): Promise<Mark> {
    const plant = await this.plantModel.findById(plantId).exec();
    if (!plant) throw new NotFoundException('Plant not found');

    const created = new this.markModel({
      user: new Types.ObjectId(userId),
      plant: new Types.ObjectId(plantId),
    });
    return created.save();
  }

  async findAll(): Promise<Mark[]> {
    return this.markModel.find().populate('user').populate('plant').exec();
  }

  async findOne(id: string): Promise<Mark> {
    const mark = await this.markModel
      .findById(id)
      .populate('user')
      .populate('plant')
      .exec();
    if (!mark) throw new NotFoundException('Mark not found');
    return mark;
  }

  async findByUser(userId: string): Promise<Mark[]> {
    const _userId = new Types.ObjectId(userId);
    return this.markModel.find({ user: _userId }).populate('plant').exec();
  }

  async update(id: string, dto: UpdateMarkDto): Promise<Mark> {
    const mark = await this.markModel.findById(id).exec();
    if (!mark) throw new NotFoundException('Mark not found');

    if (dto.plant) {
      const plant = await this.plantModel.findById(dto.plant).exec();
      if (!plant) throw new NotFoundException('Plant not found');
      mark.plant = new Types.ObjectId(dto.plant);
    }

    return mark.save();
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.markModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Mark not found');
    return { deleted: true };
  }
}
