import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Workspace } from '@prisma/client';

/**
 * CreateTagDto
 *
 * Validation DTO for creating a new tag.
 * Enforces name length (1-50 chars), hex color pattern, and workspace array.
 */
export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #FF5733)',
  })
  color: string;

  @IsArray()
  @IsEnum(Workspace, { each: true })
  workspaces: Workspace[];
}
