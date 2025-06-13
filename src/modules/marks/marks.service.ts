import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Mark } from './schemas/mark.schema';
// import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';
import { Plant } from '../plants/schemas/plant.schema';

/** ---- Interface “lean” sau populate ---- */
export interface LeanFamily {
  _id: Types.ObjectId;
  name: string;
}

export interface LeanPlant {
  _id: Types.ObjectId;
  scientific_name: string;
  common_name: string[];
  images?: string[];
  attributes: Types.ObjectId[] | { _id: Types.ObjectId; name: string }[];
  // ✳️ thêm dòng dưới
  family?: Types.ObjectId | LeanFamily; // sau populate sẽ là LeanFamily
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
  family: { _id: string; name: string } | null;
  attributes: { _id: string; name: string }[];
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

  async create(userId: string, plantId: string): Promise<MarkCompact> {
    /* 1. Lưu mark */
    const mark = await this.markModel.create({
      user: new Types.ObjectId(userId),
      plant: new Types.ObjectId(plantId),
    });

    /* 2. Lấy mark + populate */
    const populated = await this.markModel
      .findById(mark._id)
      .populate({
        path: 'plant',
        select: 'scientific_name common_name images family attributes',
        populate: [
          { path: 'family', select: 'name' },
          { path: 'attributes', select: 'name' },
        ],
      })
      .lean<LeanMark>()
      .exec();

    // ⬇️ Nếu vì lý do nào đó vẫn null → ném lỗi
    if (!populated)
      throw new InternalServerErrorException(
        'Failed to populate mark just created',
      );

    /* 3. Trả về MarkCompact */
    return {
      _id: populated._id.toString(), // _id của Mark
      plant: {
        _id: populated.plant._id.toString(),
        scientific_name: populated.plant.scientific_name,
        common_name: populated.plant.common_name,
        image: populated.plant.images?.[0] ?? null,
        family: populated.plant.family
          ? {
              _id: (populated.plant.family as any)._id.toString(),
              name: (populated.plant.family as any).name,
            }
          : null,
        attributes: (populated.plant.attributes as any[]).map((a) => ({
          _id: a._id.toString(),
          name: a.name,
        })),
      },
    };
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
    const marks = await this.markModel
      .find({ user: new Types.ObjectId(userId) })
      .populate({
        path: 'plant',
        select: 'scientific_name common_name images attributes family',
        populate: [
          { path: 'attributes', select: 'name' },
          { path: 'family', select: 'name' },
        ],
      })
      // ⬇️ chỉ định đúng kiểu LeanMark (đã có family)
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
          family:
            m.plant.family && (m.plant.family as any).name
              ? {
                  _id: (m.plant.family as any)._id.toString(),
                  name: (m.plant.family as any).name,
                }
              : null,
          attributes: (m.plant.attributes as any[]).map((a) => ({
            _id: a._id.toString(),
            name: a.name,
          })),
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
