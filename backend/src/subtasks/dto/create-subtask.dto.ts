import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

/**
 * CreateSubtaskDto
 *
 * Validation DTO for creating a new subtask.
 * Enforces required fields and max lengths.
 * Parent taskId comes from URL path parameter, not body.
 */
export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;
}
