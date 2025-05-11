import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttributeDocument = Attribute & Document;

@Schema()
export class Attribute {
  @Prop({ required: true, unique: true })
  name: string;
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);
