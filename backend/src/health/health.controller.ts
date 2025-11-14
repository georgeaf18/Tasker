import { Controller, Get } from '@nestjs/common';

interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

@Controller('health')
export class HealthController {
  /**
   * Health check endpoint for monitoring and load balancers.
   *
   * Returns basic application health status including:
   * - Service status (always 'ok' if responding)
   * - Current timestamp in ISO 8601 format
   * - Process uptime in seconds
   *
   * @returns Health status object
   */
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
