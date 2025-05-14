import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Attribute extends Document {
  @Prop({ required: true, unique: true })
  name: string;
}
export const AttributeSchema = SchemaFactory.createForClass(Attribute);
