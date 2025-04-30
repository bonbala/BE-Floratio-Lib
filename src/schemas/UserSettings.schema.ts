import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserSettings {
  @Prop({ required: false })
  receiveNotifications?: boolean;

  @Prop({ required: false })
  receiveSMS?: boolean;

  @Prop({ required: false })
  receiveEmails?: boolean;
}

export const UserSettingSchema = SchemaFactory.createForClass(UserSettings);
