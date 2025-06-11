import { IsMongoId } from 'class-validator';

export class CreateMarkDto {
  @IsMongoId()
  plantId: string;
}
