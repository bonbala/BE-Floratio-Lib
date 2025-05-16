import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  SpeciesDescription,
  SpeciesDescriptionSchema,
} from './species-description.schema';
import { User } from '../../users/schemas/user.schema';
import { Attribute } from '../../plants/schemas/attribute.schema';
import { Family } from '../../plants/schemas/family.schema';

export enum ContributeStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

export enum ContributeType {
  Update = 'update',
  New = 'new',
}

@Schema({ timestamps: true })
export class Contribute extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  scientific_name: string;

  @Prop({ type: [String], default: [] })
  common_name: string[];

  @Prop()
  description: string;

  @Prop({ type: [Types.ObjectId], ref: Attribute.name, default: [] })
  attributes: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [SpeciesDescriptionSchema], default: [] })
  species_description: SpeciesDescription[];

  @Prop({ type: Types.ObjectId, ref: Family.name })
  suggested_family: Types.ObjectId;

  @Prop({
    type: String,
    enum: ContributeStatus,
    default: ContributeStatus.pending,
  })
  status: ContributeStatus;

  @Prop({
    type: String,
    enum: ContributeType,
    required: true,
  })
  type: ContributeType;

  @Prop({ type: Types.ObjectId, ref: User.name })
  reviewed_by: Types.ObjectId;

  @Prop()
  review_message: string;
}
export const ContributeSchema = SchemaFactory.createForClass(Contribute);

export type ContributeDocument = Contribute &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };
