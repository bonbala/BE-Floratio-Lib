import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Permission } from '../../permissions/schemas/permission.schema';

@Schema()
export class Role extends Document {
  @Prop({ required: true, unique: true }) name: string;

  @Prop({ type: [Types.ObjectId], ref: Permission.name, default: [] })
  permissions: Types.ObjectId[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
