import { PartialType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';

/**
 * UpdateTagDto
 *
 * Validation DTO for updating an existing tag.
 * Makes all CreateTagDto fields optional.
 */
export class UpdateTagDto extends PartialType(CreateTagDto) {}
