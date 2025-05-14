import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Plant } from '../../plants/schemas/plant.schema';

@Schema({ timestamps: true })
export class Mark extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Plant.name, required: true })
  plant: Types.ObjectId;
}
export const MarkSchema = SchemaFactory.createForClass(Mark);
