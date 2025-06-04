import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ParseJsonPipe } from './common/pipe/parse-json.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://floratio-lib-client.vercel.app',
      'https://floratio-lib-admin.vercel.app',
      'https://flora-lib-admin.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // nếu cần gửi cookie/token
    preflightContinue: false, // Nest sẽ tự handle OPTIONS
  });
  app.useGlobalPipes(
    new ParseJsonPipe(),
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
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

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port, '0.0.0.0');
  console.log(` Server chạy tại http://localhost:${process.env.PORT ?? 3000}`);
  console.log(
    ` Swagger UI: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}
bootstrap();
