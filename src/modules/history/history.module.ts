// src/history/history.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { History, HistorySchema } from './schemas/history.schema';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { PlantsModule } from '../plants/plants.module';
import { Plant, PlantSchema } from '../plants/schemas/plant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: History.name, schema: HistorySchema },
      { name: Plant.name, schema: PlantSchema },
    ]),
    forwardRef(() => PlantsModule),
  ],
  providers: [HistoryService],
  controllers: [HistoryController],
  exports: [HistoryService], // <-- cho phép inject HistoryService ở module khác
})
export class HistoryModule {}
