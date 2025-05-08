import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FamilyDocument = Family & Document;

@Schema()
export class Family {
  @Prop({ required: true, unique: true })
  name: string;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
