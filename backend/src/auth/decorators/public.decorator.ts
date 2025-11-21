import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for marking endpoints as public
 * Used by ApiKeyGuard to skip authentication
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark endpoints as public (no API key required)
 * Use this for health checks or other public endpoints
 *
 * @example
 * ```typescript
 * @Controller('health')
 * export class HealthController {
 *   @Get()
 *   @Public()
 *   check() {
 *     return { status: 'ok' };
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
