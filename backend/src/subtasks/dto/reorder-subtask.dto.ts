import { IsNumber, Min } from 'class-validator';

/**
 * ReorderSubtaskDto
 *
 * Validation DTO for reordering a subtask via drag-and-drop.
 * Only position is needed for reordering operations.
 */
export class ReorderSubtaskDto {
  @IsNumber()
  @Min(0)
  position: number;
}
