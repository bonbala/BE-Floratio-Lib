// src/history/history.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { History, HistoryDocument } from './schemas/history.schema';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { HistoryQueryDto } from './dto/history-query.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private readonly historyModel: Model<HistoryDocument>,
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
}
