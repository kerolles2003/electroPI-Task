import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global validation (no DTOs yet — pipe is configured and ready for later phases).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter (placeholder).
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger setup.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('electro-PI API')
    .setDescription('electro-PI backend API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);

  logger.log(`Backend running on http://localhost:${port}`);
  logger.log(`Swagger docs on http://localhost:${port}/docs`);
}

void bootstrap();
