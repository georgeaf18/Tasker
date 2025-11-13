import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

/**
 * UpdateTaskDto
 *
 * Validation DTO for updating an existing task.
 * All fields are optional (partial) to support PATCH operations.
 * Inherits validation rules from CreateTaskDto.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
