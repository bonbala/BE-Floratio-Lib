import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlantDocument = Plant & Document;

@Schema()
export class Plant {
  @Prop({ required: true })
  scientific_name: string;

  @Prop()
  common_name: string;

  @Prop([String])
  image_url: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Section' }] })
  info_sections: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Phylum' })
  phylum: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Family' })
  family: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Attribute', default: [] })
  attributes: Types.ObjectId[];
}

export const PlantSchema = SchemaFactory.createForClass(Plant);
