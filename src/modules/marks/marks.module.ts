import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MarksService } from './marks.service';
import { MarksController } from './marks.controller';
import { Mark, MarkSchema } from './schemas/mark.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Plant, PlantSchema } from '../plants/schemas/plant.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Mark.name, schema: MarkSchema },
      { name: User.name, schema: UserSchema },
      { name: Plant.name, schema: PlantSchema },
    ]),
  ],
  controllers: [MarksController],
  providers: [MarksService],
})
export class MarksModule {}
