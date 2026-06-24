import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AppLogger } from './common/logger/app-logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  // Route all framework + application logs through the swappable AppLogger.
  app.useLogger(app.get(AppLogger));
  const logger = new Logger('Bootstrap');
  const config = app.get(ConfigService);

  // Security headers (CSP, HSTS, X-Frame-Options, etc.).
  app.use(helmet());

  // Parse cookies so the JWT strategies can read HTTP-only auth cookies.
  app.use(cookieParser());

  // Allow the browser frontend to call the API with credentials (auth cookies).
  app.enableCors({
    origin: config.get<string>('frontendUrl') ?? true,
    credentials: true,
  });

  // Global validation (no DTOs yet — pipe is configured and ready for later phases).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // The global exception filter is registered via APP_FILTER in AppModule (DI-aware).

  // Swagger setup.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('electro-PI API')
    .setDescription('electro-PI backend API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.getOrThrow<number>('port');
  await app.listen(port);

  logger.log(`Backend running on http://localhost:${port}`);
  logger.log(`Swagger docs on http://localhost:${port}/docs`);
}

void bootstrap();
