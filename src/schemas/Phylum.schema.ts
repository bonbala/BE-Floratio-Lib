// phylum.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhylumDocument = Phylum & Document;

@Schema()
export class Phylum {
  @Prop({ required: true, unique: true })
  name: string;
}

export const PhylumSchema = SchemaFactory.createForClass(Phylum);
