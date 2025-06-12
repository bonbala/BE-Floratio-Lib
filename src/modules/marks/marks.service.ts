import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Mark } from './schemas/mark.schema';
// import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';
import { Plant } from '../plants/schemas/plant.schema';

/** ---- Interface “lean” sau populate ---- */
interface LeanPlant {
  _id: Types.ObjectId;
  scientific_name: string;
  common_name: string[];
  images: string[];
  attributes: string[];
}
interface LeanMark {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  plant: LeanPlant;
}
/** ---- Kiểu dữ liệu trả về gọn ---- */
type CompactPlant = {
  _id: string;
  scientific_name: string;
  common_name: string[];
  image: string | null;
  attributes: string[];
};
type MarkCompact = {
  _id: string;
  plant: CompactPlant;
};

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

  async findByUser(userId: string): Promise<MarkCompact[]> {
    const _userId = new Types.ObjectId(userId);
    const marks = await this.markModel
      .find({ user: _userId })
      .populate({
        path: 'plant',
        select: 'scientific_name common_name images attributes', // chọn field cần
      })
      .lean<LeanMark[]>()
      .exec();

    return marks.map(
      (m): MarkCompact => ({
        _id: m._id.toString(),
        plant: {
          _id: m.plant._id.toString(),
          scientific_name: m.plant.scientific_name,
          common_name: m.plant.common_name,
          image: m.plant.images?.[0] ?? null,
          attributes: m.plant.attributes,
        },
      }),
    );
  }

  async update(id: string, dto: UpdateMarkDto): Promise<Mark> {
    const mark = await this.markModel.findById(id).exec();
    if (!mark) throw new NotFoundException('Mark not found');

    if (dto.plantId) {
      const plant = await this.plantModel.findById(dto.plantId).exec();
      if (!plant) throw new NotFoundException('Plant not found');
      mark.plant = new Types.ObjectId(dto.plantId);
    }

    return mark.save();
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.markModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Mark not found');
    return { deleted: true };
  }
}
