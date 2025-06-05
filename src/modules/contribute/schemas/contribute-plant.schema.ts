// src/modules/contribute/schemas/contribute-plant.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export class TableItem {
  @Prop() label: string;
  @Prop() content: string;
}

@Schema({ _id: false })
export class SpeciesDescription {
  @Prop() section: string;
  @Prop({ type: [TableItem], default: [] })
  details: TableItem[];
}

@Schema({ _id: false })
export class ContributePlant extends Document {
  // tất cả optional để hỗ trợ update từng phần
  @Prop() scientific_name?: string;

  @Prop({ type: [String], default: [] })
  common_name?: string[];

  @Prop() description?: string;

  // trỏ thẳng _id của Family/Attribute để reviewer dễ join
  @Prop({ type: Types.ObjectId, ref: 'Family' })
  family?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Attribute', default: [] })
  attributes?: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop({ type: [SpeciesDescription], default: [] })
  species_description?: SpeciesDescription[];

  // khi contribute update, người dùng sẽ đính kèm _id của plant gốc
  @Prop({ type: Types.ObjectId, ref: 'Plant' })
  plant_ref?: Types.ObjectId;
}

export const ContributePlantSchema =
  SchemaFactory.createForClass(ContributePlant);
