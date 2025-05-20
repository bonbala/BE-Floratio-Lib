// src/schemas/species-description.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class TableItem {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  content: string;
}

@Schema({ _id: false })
export class SpeciesDescription extends Document {
  @Prop({ required: true })
  section: string;

  @Prop({ type: [TableItem], required: true })
  details: TableItem[];
}

export const TableItemSchema = SchemaFactory.createForClass(TableItem);
export const SpeciesDescriptionSchema =
  SchemaFactory.createForClass(SpeciesDescription);
