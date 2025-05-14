import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class TableItem extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;
}
export const TableItemSchema = SchemaFactory.createForClass(TableItem);

@Schema({ _id: false })
export class SpeciesDescription extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [TableItemSchema], default: [] })
  tables: TableItem[];
}
export const SpeciesDescriptionSchema =
  SchemaFactory.createForClass(SpeciesDescription);
