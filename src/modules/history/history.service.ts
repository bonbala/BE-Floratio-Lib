// src/history/history.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { History, HistoryDocument } from './schemas/history.schema';
import { CreateHistoryDto } from './dto/create-history.dto';

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
  ): Promise<History> {
    const dto: CreateHistoryDto = {
      plant: new Types.ObjectId(plantId),
      action: 'update',
      before: beforeSnapshot,
      after: new Types.ObjectId(plantId),
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
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
  ): Promise<History> {
    const dto: CreateHistoryDto = {
      plant: new Types.ObjectId(plantId),
      action: 'delete',
      before: beforeSnapshot,
      // after sẽ undefined tự nhiên
      updatedBy: userId ? new Types.ObjectId(userId) : undefined,
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
}
