import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true }) username: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) password: string;

  @Prop({ type: Types.ObjectId, ref: Role.name })
  role: Types.ObjectId;

  @Prop({ default: false })
  is_email_verified: boolean;

  @Prop({ default: false })
  is_banned: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
