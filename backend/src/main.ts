/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// Load environment variables from .env.local (then .env as fallback)
// This MUST be before any other imports
import { config } from 'dotenv';
import { join } from 'path';

// Nx runs from workspace root, so env files are in backend/ subdirectory
// Load .env.local first (highest priority), then .env as fallback
// override: true is required because Nx pre-loads .env.development
config({ path: join(process.cwd(), 'backend', '.env.local'), override: true });
config({ path: join(process.cwd(), 'backend', '.env'), override: true });

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (localhost:4200)
  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Enable global validation pipes for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
