import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PlantsModule } from './modules/plants/plants.module';
import { MarksModule } from './modules/marks/marks.module';
import { ContributeModule } from './modules/contribute/contribute.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PlantsModule,
    MarksModule,
    ContributeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
