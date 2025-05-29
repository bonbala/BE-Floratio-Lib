// src/history/history.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { History, HistorySchema } from './schemas/history.schema';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: History.name, schema: HistorySchema }, // <-- đây là chỗ cung cấp HistoryModel
    ]),
  ],
  providers: [HistoryService],
  controllers: [HistoryController],
  exports: [HistoryService], // <-- cho phép inject HistoryService ở module khác
})
export class HistoryModule {}
