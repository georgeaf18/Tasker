import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Workspace, TaskStatus } from '@prisma/client';

/**
 * CreateTaskDto
 *
 * Validation DTO for creating a new task.
 * Enforces required fields, max lengths, and enum constraints.
 */
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Workspace)
  workspace: Workspace;

  @IsNumber()
  @IsOptional()
  channelId?: number;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsBoolean()
  @IsOptional()
  isRoutine?: boolean;
}
