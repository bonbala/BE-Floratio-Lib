import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class createUserSettings {
  @IsOptional()
  @IsBoolean()
  recriveNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  recriveSMS?: boolean;

  @IsOptional()
  @IsBoolean()
  recrive?: boolean;
}

export class createUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsOptional()
  @ValidateNested() // Cái này validate đóng tổ của UserSetting trên
  @Type(() => createUserSettings)
  settings?: createUserSettings;
}
