import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './guards/api-key.guard';

/**
 * Authentication module
 * Provides API key-based authentication for the application
 *
 * This module registers the ApiKeyGuard as a global guard,
 * protecting all endpoints by default. Use the @Public() decorator
 * to mark specific endpoints as publicly accessible.
 */
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
  ],
})
export class AuthModule {}
