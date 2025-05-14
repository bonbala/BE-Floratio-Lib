import { PartialType } from '@nestjs/mapped-types';
import { CreateContributeDto } from './create-contribute.dto';
import { IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ContributeStatus } from '../schemas/contribute.schema';

export class UpdateContributeDto extends PartialType(CreateContributeDto) {
  @IsOptional()
  @IsEnum(ContributeStatus)
  status?: ContributeStatus;

  @IsOptional()
  @IsString()
  review_message?: string;
}
