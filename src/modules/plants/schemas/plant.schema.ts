// src/schemas/plant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Family } from './family.schema';
import { Attribute } from './attribute.schema';
import {
  SpeciesDescription,
  SpeciesDescriptionSchema,
} from './species-description.schema';

@Schema({ timestamps: true })
export class Plant extends Document {
  @Prop({ required: true })
  scientific_name: string;

  @Prop({ type: [String], default: [] })
  common_name: string[];

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: Family.name, required: true })
  family: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: Attribute.name })
  attributes: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [SpeciesDescriptionSchema], default: [] })
  species_description: SpeciesDescription[];

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const PlantSchema = SchemaFactory.createForClass(Plant);
