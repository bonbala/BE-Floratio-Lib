import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ContributeService } from './contribute.service';
import { ContributeController } from './contribute.controller';
import { Contribute, ContributeSchema } from './schemas/contribute.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Attribute, AttributeSchema } from '../plants/schemas/attribute.schema';
import { Family, FamilySchema } from '../plants/schemas/family.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Contribute.name, schema: ContributeSchema },
      { name: User.name, schema: UserSchema },
      { name: Attribute.name, schema: AttributeSchema },
      { name: Family.name, schema: FamilySchema },
    ]),
  ],
  controllers: [ContributeController],
  providers: [ContributeService],
})
export class ContributeModule {}
