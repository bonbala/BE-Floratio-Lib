import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ContributesService } from './contribute.service';
import { ContributesController } from './contribute.controller';
import { Contribute, ContributeSchema } from './schemas/contribute.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Attribute, AttributeSchema } from '../plants/schemas/attribute.schema';
import { Family, FamilySchema } from '../plants/schemas/family.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PlantsModule } from '../plants/plants.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Contribute.name, schema: ContributeSchema },
      { name: User.name, schema: UserSchema },
      { name: Attribute.name, schema: AttributeSchema },
      { name: Family.name, schema: FamilySchema },
    ]),
    CloudinaryModule,
    PlantsModule,
    HistoryModule,
  ],
  controllers: [ContributesController],
  providers: [ContributesService],
})
export class ContributeModule {}
