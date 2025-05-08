import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlantsService } from './plants.service';
import { PlantsController } from './plants.controller';
import { Plant, PlantSchema } from 'src/schemas/Plants.schema';
import { Section, SectionSchema } from 'src/schemas/InfoDetails.schema';
import { Detail, DetailSchema } from 'src/schemas/Details.schema';
import { Phylum, PhylumSchema } from 'src/schemas/Phylum.schema';
import { Family, FamilySchema } from 'src/schemas/Family.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Plant.name, schema: PlantSchema },
      { name: Section.name, schema: SectionSchema },
      { name: Detail.name, schema: DetailSchema },
      { name: Phylum.name, schema: PhylumSchema },
      { name: Family.name, schema: FamilySchema },
    ]),
  ],
  controllers: [PlantsController],
  providers: [PlantsService],
})
export class PlantsModule {}
