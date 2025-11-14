import {
  IsString,
  IsOptional,
  IsNotEmpty,
  validateSync,
} from 'class-validator';
import { plainToClass } from 'class-transformer';

/**
 * Environment variable validation schema.
 *
 * Validates required and optional environment variables on application startup.
 * Uses class-validator for declarative validation rules.
 */
export class EnvironmentVariables {
  /**
   * PostgreSQL database connection URL.
   * Required for Prisma ORM to connect to the database.
   *
   * Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
   */
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  /**
   * Application port number.
   * Defaults to 3000 if not provided.
   */
  @IsString()
  @IsOptional()
  PORT?: string;

  /**
   * Comma-separated list of allowed CORS origins.
   * Defaults to http://localhost:4200 if not provided.
   *
   * Example: http://localhost:4200,https://yourdomain.com
   */
  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS?: string;

  /**
   * Node environment (development, production, test).
   * Used for environment-specific configuration.
   */
  @IsString()
  @IsOptional()
  NODE_ENV?: string;
}

/**
 * Validates environment variables on application startup.
 *
 * Throws an error if required variables are missing or invalid.
 * This function is called by NestJS during the module initialization.
 *
 * @param config - Raw environment variables from process.env
 * @returns Validated environment variables
 * @throws Error if validation fails with detailed error messages
 */
export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints).join(', ')
          : 'Unknown validation error';
        return `${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${errorMessages}\n\nPlease check your .env file.`,
    );
  }

  return validatedConfig;
}
