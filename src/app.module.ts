import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://nhathieu1805:9PvVUob8KSOT1mBP@cluster0.jtqgese.mongodb.net/',
    ),
    UsersModule,
    AuthModule,
    RolesModule, // Kết nối tới link mongodb
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
