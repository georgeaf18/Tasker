import { IsOptional, IsEnum } from 'class-validator';
import { Workspace } from '@prisma/client';

/**
 * TagFilterDto
 *
 * Validation DTO for filtering tags by workspace.
 * All fields are optional for flexible querying.
 */
export class TagFilterDto {
  @IsOptional()
  @IsEnum(Workspace)
  workspace?: Workspace;
}
