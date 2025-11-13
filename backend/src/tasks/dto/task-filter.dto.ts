import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Workspace, TaskStatus } from '@prisma/client';

/**
 * TaskFilterDto
 *
 * Query parameters for filtering tasks in GET /api/tasks.
 * All filters are optional - returns all tasks if none provided.
 */
export class TaskFilterDto {
  @IsEnum(Workspace)
  @IsOptional()
  workspace?: Workspace;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  channelId?: number;
}
