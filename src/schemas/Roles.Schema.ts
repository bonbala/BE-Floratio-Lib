import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];
}

// ✅ Sửa dòng này để đảm bảo _id có kiểu là Types.ObjectId
export type RoleDocument = Document & Role & { _id: Types.ObjectId };

export const RoleSchema = SchemaFactory.createForClass(Role);
