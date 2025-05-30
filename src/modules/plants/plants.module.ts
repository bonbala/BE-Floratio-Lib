// src/modules/plants/plants.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlantsService } from './plants.service';
import { PlantsController } from './plants.controller';
import { Plant, PlantSchema } from './schemas/plant.schema';
import { Family, FamilySchema } from './schemas/family.schema';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plant.name, schema: PlantSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Attribute.name, schema: AttributeSchema },
    ]),
    CloudinaryModule,
    HistoryModule,
  ],
  providers: [PlantsService],
  controllers: [PlantsController],
  exports: [PlantsService],
})
export class PlantsModule {}
