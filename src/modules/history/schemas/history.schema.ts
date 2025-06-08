// src/history/schemas/history.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Plant } from 'src/modules/plants/schemas/plant.schema';

export type HistoryDocument = History & Document;

@Schema({ timestamps: true })
export class History {
  /** Tham chiếu tới cây bị tác động */
  @Prop({ type: Types.ObjectId, ref: Plant.name, required: true })
  plant: Types.ObjectId;

  /** Hành động: update | delete */
  @Prop({ enum: ['update', 'delete', 'rollback'], required: true })
  action: 'update' | 'delete' | 'rollback';

  /** Snapshot đầy đủ trước khi thay đổi */
  @Prop({ type: Object, required: true })
  before: Record<string, any>;

  /** Với update: chỉ lưu ObjectId của bản ghi mới nhất */
  @Prop({ type: Types.ObjectId, ref: Plant.name })
  after?: Types.ObjectId;

  /** Ai thực hiện (nếu muốn) */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  contribute_by?: Types.ObjectId;
}

export const HistorySchema = SchemaFactory.createForClass(History);
