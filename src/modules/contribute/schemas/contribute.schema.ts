import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Contribute extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  c_user: Types.ObjectId;

  @Prop({ enum: ['create', 'update'], required: true })
  type: 'create' | 'update';

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: 'pending' | 'approved' | 'rejected';

  @Prop()
  c_message?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewed_by?: Types.ObjectId;

  @Prop()
  review_message?: string;

  @Prop({ type: Object })
  data: {
    plant: any; // lưu theo format của plant (schema đầy đủ)
    newImages?: string[];
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export const ContributeSchema = SchemaFactory.createForClass(Contribute);
