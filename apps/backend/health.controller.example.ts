import { Controller, Get } from '@nestjs/common';

/**
 * Health Check Controller
 *
 * Provides endpoints for Docker health checks and monitoring.
 * Add this to your backend's app.module.ts or create a health.module.ts
 */
@Controller()
export class HealthController {
  /**
   * Basic health check endpoint
   * Returns 200 OK if the application is running
   */
  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness check endpoint
   * Can be extended to check database connectivity, etc.
   */
  @Get('ready')
  readinessCheck(): { ready: boolean; timestamp: string } {
    return {
      ready: true,
      timestamp: new Date().toISOString(),
    };
  }
}
