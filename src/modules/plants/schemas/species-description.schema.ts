// src/schemas/species-description.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class TableItem {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;
}

@Schema({ _id: false })
export class SpeciesDescription extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [TableItem], required: true })
  tables: TableItem[];
}

export const TableItemSchema = SchemaFactory.createForClass(TableItem);
export const SpeciesDescriptionSchema =
  SchemaFactory.createForClass(SpeciesDescription);
