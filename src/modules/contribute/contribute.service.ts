import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contribute, ContributeStatus } from './schemas/contribute.schema';
import { CreateContributeDto } from './dto/create-contribute.dto';
import { UpdateContributeDto } from './dto/update-contribute.dto';

@Injectable()
export class ContributeService {
  constructor(
    @InjectModel(Contribute.name) private contribModel: Model<Contribute>,
  ) {}

  async create(userId: string, dto: CreateContributeDto): Promise<Contribute> {
    const data: Partial<Contribute> = {
      user: new Types.ObjectId(userId),
      scientific_name: dto.scientific_name,
      common_name: dto.common_name || [],
      description: dto.description,
      attributes: dto.attributes?.map((id) => new Types.ObjectId(id)) || [],
      images: dto.images || [],
      species_description: dto.species_description || [],
      suggested_family: dto.suggested_family
        ? new Types.ObjectId(dto.suggested_family)
        : undefined,
      status: ContributeStatus.pending,
    };
    return new this.contribModel(data).save();
  }

  async findAll(): Promise<Contribute[]> {
    return this.contribModel.find().exec();
  }

  async findOne(id: string): Promise<Contribute> {
    const item = await this.contribModel.findById(id).exec();
    if (!item) throw new NotFoundException('Contribution not found');
    return item;
  }

  async update(
    userId: string,
    role: string,
    id: string,
    dto: UpdateContributeDto,
  ): Promise<Contribute> {
    const item = await this.contribModel.findById(id).exec();
    if (!item) throw new NotFoundException('Contribution not found');

    if (dto.status) {
      if (role !== 'admin')
        throw new ForbiddenException('Only admins can change status');
      item.status = dto.status;
      item.reviewed_by = new Types.ObjectId(userId);
      if (dto.review_message) item.review_message = dto.review_message;
    }

    if (
      item.status === ContributeStatus.pending &&
      item.user.toString() === userId
    ) {
      item.scientific_name = dto.scientific_name ?? item.scientific_name;
      item.common_name = dto.common_name ?? item.common_name;
      item.description = dto.description ?? item.description;
      item.attributes =
        dto.attributes?.map((id) => new Types.ObjectId(id)) ?? item.attributes;
      item.images = dto.images ?? item.images;
      item.species_description =
        dto.species_description ?? item.species_description;
      item.suggested_family = dto.suggested_family
        ? new Types.ObjectId(dto.suggested_family)
        : item.suggested_family;
    }

    return item.save();
  }

  async remove(
    userId: string,
    role: string,
    id: string,
  ): Promise<{ deleted: boolean }> {
    const item = await this.contribModel.findById(id).exec();
    if (!item) throw new NotFoundException('Contribution not found');
    if (item.user.toString() !== userId && role !== 'admin')
      throw new ForbiddenException('Not allowed to delete');
    await this.contribModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
