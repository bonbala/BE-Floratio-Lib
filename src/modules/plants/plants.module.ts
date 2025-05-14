/* src/modules/plants/plants.module.ts */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PlantsService } from './plants.service';
import { PlantsController } from './plants.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Attribute, AttributeSchema } from './schemas/attribute.schema';
import { Family, FamilySchema } from './schemas/family.schema';
import { Plant, PlantSchema } from './schemas/plant.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Attribute.name, schema: AttributeSchema },
      { name: Family.name, schema: FamilySchema },
      { name: Plant.name, schema: PlantSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [PlantsController],
  providers: [PlantsService],
  exports: [PlantsService],
})
export class PlantsModule {}
