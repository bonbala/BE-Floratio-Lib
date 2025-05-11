import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PlantsModule } from './plants/plants.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryService } from './cloudinary/clodinary.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
    AuthModule,
    RolesModule,
    PlantsModule,
    CloudinaryModule, // Kết nối tới link mongodb
  ],
  controllers: [],
  providers: [CloudinaryService],
})
export class AppModule {}
