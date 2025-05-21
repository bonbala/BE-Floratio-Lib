import { IsString, IsOptional } from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description?: string;
}
