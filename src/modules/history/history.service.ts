// src/history/history.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { History, HistoryDocument } from './schemas/history.schema';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { Plant } from '../plants/schemas/plant.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private readonly historyModel: Model<HistoryDocument>,
    @InjectModel(Plant.name)
    private readonly plantModel: Model<Plant>,
  ) {}

  /**
   * Tạo log chung, sử dụng DTO
   */
  async create(createHistoryDto: CreateHistoryDto): Promise<History> {
    return this.historyModel.create(createHistoryDto);
  }

  /**
   * Ghi log khi update cây
   */
  async createOnUpdate(
    plantId: string,
    beforeSnapshot: Record<string, any>,
    userId?: string,
    contributeBy?: string,
  ): Promise<History> {
    const dto: CreateHistoryDto = {
      plant: new Types.ObjectId(plantId),
      action: 'update',
      before: beforeSnapshot,
      after: new Types.ObjectId(plantId),
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
      contributeBy: contributeBy ? new Types.ObjectId(contributeBy) : undefined, // ← mới
    };
    return this.create(dto);
  }

  /**
   * Ghi log khi delete cây
   */
  async createOnDelete(
    plantId: string,
    beforeSnapshot: Record<string, any>,
    userId?: string,
    contributeBy?: string,
  ): Promise<History> {
    const dto: CreateHistoryDto = {
      plant: new Types.ObjectId(plantId),
      action: 'delete',
      before: beforeSnapshot,
      // after sẽ undefined tự nhiên
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
      contributeBy: contributeBy ? new Types.ObjectId(contributeBy) : undefined,
    };
    return this.create(dto);
  }

  /**
   * Lấy lịch sử theo plantId
   */
  async findByPlant(plantId: string) {
    return this.historyModel
      .find({ plant: plantId })
      .sort({ createdAt: -1 })
      .lean();
  }

  /** Lấy danh sách history có phân trang và filter */
  async findAll(query: HistoryQueryDto): Promise<{
    data: HistoryDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, action, plant, updatedBy } = query;
    const filter: any = {};
    if (action) filter.action = action;
    if (plant) filter.plant = new Types.ObjectId(plant);
    if (updatedBy) filter.updatedBy = new Types.ObjectId(updatedBy);

    const skip = (page - 1) * limit;
    const total = await this.historyModel.countDocuments(filter);
    const data = await this.historyModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** Lấy 1 history theo id */
  async findOne(id: string): Promise<HistoryDocument> {
    const history = await this.historyModel.findById(id).lean();
    if (!history)
      throw new NotFoundException(`History with id ${id} not found`);
    return history as HistoryDocument;
  }

  /** Cập nhật history (nếu cần) */
  async update(
    id: string,
    updateDto: UpdateHistoryDto,
  ): Promise<HistoryDocument> {
    const updated = await this.historyModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .lean();
    if (!updated)
      throw new NotFoundException(`History with id ${id} not found`);
    return updated as HistoryDocument;
  }

  /** Xóa 1 history */
  async remove(id: string): Promise<void> {
    const res = await this.historyModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException(`History with id ${id} not found`);
  }

  /** Khôi phục 1 history và set action = 'rollback' */
  async rollbackOne(historyId: string): Promise<Plant> {
    const hist = await this.historyModel.findById(historyId).lean();
    if (!hist)
      throw new NotFoundException(`History ${historyId} không tồn tại`);

    let result: Plant;

    if (hist.action === 'update') {
      const plantId = hist.plant.toString();
      const before = hist.before;
      const updated = await this.plantModel.findByIdAndUpdate(plantId, before, {
        new: true,
      });
      if (!updated)
        throw new NotFoundException(`Không tìm thấy Plant ${plantId}`);
      result = updated;
    } else if (hist.action === 'delete') {
      const before = hist.before;
      const doc = new this.plantModel(before);
      result = await doc.save();
    } else {
      throw new BadRequestException(`Không thể rollback action ${hist.action}`);
    }

    // Cập nhật action của history lên 'rollback'
    await this.historyModel.findByIdAndUpdate(historyId, {
      action: 'rollback',
    });

    return result;
  }

  /** Khôi phục nhiều history, set action = 'rollback' cho từng bản ghi */
  async rollbackMany(historyIds: string[]): Promise<Plant[]> {
    const hists = await this.historyModel
      .find({ _id: { $in: historyIds.map((id) => new Types.ObjectId(id)) } })
      .sort({ createdAt: -1 })
      .lean();

    if (!hists.length)
      throw new NotFoundException(`Không tìm thấy bất kỳ history nào`);

    const results: Plant[] = [];
    for (const hist of hists) {
      let plant: Plant;

      if (hist.action === 'update') {
        const plantId = hist.plant.toString();
        const updated = await this.plantModel.findByIdAndUpdate(
          plantId,
          hist.before,
          { new: true },
        );
        if (!updated)
          throw new NotFoundException(`Không tìm thấy Plant ${plantId}`);
        plant = updated;
      } else if (hist.action === 'delete') {
        const doc = new this.plantModel(hist.before);
        plant = await doc.save();
      } else {
        // Nếu action đã là 'rollback' hoặc không phải update/delete, bỏ qua
        continue;
      }

      // Cập nhật action của history lên 'rollback'
      await this.historyModel.findByIdAndUpdate(hist._id, {
        action: 'rollback',
      });

      results.push(plant);
    }

    return results;
  }

  // Lấy danh sách history của một plant
  async findByPlantId(plantId: string): Promise<History[]> {
    if (!Types.ObjectId.isValid(plantId)) {
      throw new BadRequestException('Định dạng plantId không hợp lệ');
    }

    const histories = await this.historyModel
      .find({ plant: new Types.ObjectId(plantId) })
      .sort({ createdAt: -1 })
      .lean();

    if (!histories.length) {
      // Có thể trả về mảng rỗng thay vì NotFound
      return [];
    }
    return histories;
  }
}
