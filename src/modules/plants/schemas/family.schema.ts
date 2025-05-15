// src/schemas/family.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Family extends Document {
  @Prop({ required: true, unique: true })
  name: string;
}

export const FamilySchema = SchemaFactory.createForClass(Family);
