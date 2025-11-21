import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard to validate API key in request headers
 * Protects all endpoints by default unless marked with @Public()
 *
 * The API key must be provided in the 'x-api-key' header
 * and must match the API_KEY environment variable.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if endpoint is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];

    // Check if API key is provided
    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    // Validate API key from environment variable
    const validApiKey = process.env.API_KEY;

    // Ensure API_KEY is configured in environment
    if (!validApiKey) {
      throw new Error(
        'API_KEY environment variable is not configured. Please set API_KEY in your environment file.'
      );
    }

    // Validate API key matches
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
