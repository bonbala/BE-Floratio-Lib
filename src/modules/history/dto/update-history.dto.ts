// src/history/dto/update-history.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateHistoryDto } from './create-history.dto';

export class UpdateHistoryDto extends PartialType(CreateHistoryDto) {}
