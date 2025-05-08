import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DetailDocument = Detail & Document;

@Schema()
export class Detail {
  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  content: string;
}

export const DetailSchema = SchemaFactory.createForClass(Detail);
