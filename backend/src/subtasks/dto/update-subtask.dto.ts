import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';
import { SubtaskStatus } from '@prisma/client';

/**
 * UpdateSubtaskDto
 *
 * Validation DTO for updating an existing subtask.
 * All fields are optional to support partial PATCH operations.
 * Supports updating title, status, and position.
 */
export class UpdateSubtaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string;

  @IsEnum(SubtaskStatus)
  @IsOptional()
  status?: SubtaskStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;
}
