import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'https://floratio-lib-client.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // nếu cần gửi cookie/token
    preflightContinue: false, // Nest sẽ tự handle OPTIONS
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // --- Cấu hình Swagger ---
  const config = new DocumentBuilder()
    .setTitle('API Plants')
    .setDescription('REST API cho dự án tra cứu thực vật')
    .setVersion('1.0')
    .addBearerAuth(
      {
        // nếu bạn dùng JWT
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  // --------------------------

  await app.listen(process.env.PORT ?? 3000);
  console.log(` Server chạy tại http://localhost:${process.env.PORT ?? 3000}`);
  console.log(
    ` Swagger UI: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}
bootstrap();
