import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SectionDocument = Section & Document;

@Schema()
export class Section {
  @Prop({ required: true })
  section_name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Detail' }] })
  details: Types.ObjectId[];
}

export const SectionSchema = SchemaFactory.createForClass(Section);
