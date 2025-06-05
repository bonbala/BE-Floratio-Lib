// src/modules/contribute/schemas/contribute.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  ContributePlant,
  ContributePlantSchema,
} from './contribute-plant.schema';

@Schema({ _id: false })
class ContributeData {
  @Prop({ type: Types.ObjectId, ref: 'Plant' })
  plant_ref?: Types.ObjectId; // chỉ khi type = update

  @Prop({ type: ContributePlantSchema, required: true })
  plant: ContributePlant; // bản đề xuất (create / update)

  @Prop({ type: [String], default: [] })
  new_images: string[];
}
export const ContributeDataSchema =
  SchemaFactory.createForClass(ContributeData);

@Schema({ timestamps: true })
export class Contribute extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  c_user: Types.ObjectId;

  @Prop({ enum: ['create', 'update'], required: true })
  type: 'create' | 'update';

  @Prop({
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';

  @Prop() c_message?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewed_by?: Types.ObjectId;

  @Prop() review_message?: string;

  /* ---- DỮ LIỆU ĐÓNG GÓP ---- */
  @Prop({ type: ContributeDataSchema, required: true })
  data: ContributeData;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ContributeSchema = SchemaFactory.createForClass(Contribute);
