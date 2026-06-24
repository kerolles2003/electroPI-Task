import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { AppLogger } from './common/logger/app-logger.service';

async function bootstrap(): Promise<void> {
  // rawBody: true preserves the exact request bytes (req.rawBody) so the Stripe
  // webhook can verify signatures; existing JSON parsing is unaffected.
  const app = await NestFactory.create(AppModule, { bufferLogs: true, rawBody: true });
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

  // ── Swagger ────────────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('electro-PI API')
    .setDescription(
      `
## Overview

REST API for the **electro-PI** e-commerce platform.

---

## Authentication

This API uses **HTTP-only cookie authentication**. Two cookies are managed server-side:

| Cookie | TTL | Purpose |
|---|---|---|
| \`access_token\` | 7 days | Sent on every authenticated request |
| \`refresh_token\` | 7 days | Rotates the token pair via \`POST /auth/refresh\` |

### Testing in Swagger UI

1. Expand **POST /auth/login** → click **Try it out** → fill credentials → **Execute**
2. The browser stores the cookies automatically (same-origin request)
3. All subsequent requests in this tab will be authenticated — no manual token entry needed

> **Note:** Cookies are \`HttpOnly\` — they are not readable by JavaScript but are forwarded automatically by the browser on every same-origin request.

---

## Rate Limiting

Sensitive endpoints enforce per-IP rate limits to prevent abuse. Exceeding a limit returns **HTTP 429 Too Many Requests**. Per-endpoint limits are documented on each operation.

---

## Error Responses

All errors follow a consistent envelope:

\`\`\`json
{
  "statusCode": 400,
  "path": "/auth/register",
  "message": "Email already registered"
}
\`\`\`

Validation errors nest the constraint list inside \`message\`:

\`\`\`json
{
  "statusCode": 400,
  "path": "/auth/register",
  "message": {
    "statusCode": 400,
    "message": ["name must be longer than or equal to 2 characters"],
    "error": "Bad Request"
  }
}
\`\`\`
`.trim(),
    )
    .setVersion('1.0.0')
    .setContact('electro-PI Support', 'http://localhost:3000', 'support@electro-pi.com')
    .addServer('http://localhost:3001', 'Local development')
    // securityName must match the argument passed to @ApiCookieAuth() in controllers.
    // @ApiCookieAuth() with no args defaults to 'cookie'.
    .addCookieAuth(
      'access_token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'Short-lived access token (15 min). Set automatically on login/register.',
      },
      'cookie',
    )
    .addTag('auth', 'Registration, login, token rotation, email verification, and session management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'electro-PI API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 3,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
  });
  // ──────────────────────────────────────────────────────────────────────────────

  const port = config.getOrThrow<number>('port');
  await app.listen(port);

  logger.log(`Backend running on  http://localhost:${port}`);
  logger.log(`Swagger docs at     http://localhost:${port}/docs`);
}

void bootstrap();
