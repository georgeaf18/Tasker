import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagFilterDto } from './dto/tag-filter.dto';

/**
 * TagsController
 *
 * REST API endpoints for tag management and task-tag associations.
 * All routes prefixed with /api/tags (global prefix + controller route).
 *
 * Endpoints:
 * - GET    /api/tags                         - List tags with optional workspace filter
 * - POST   /api/tags                         - Create new tag
 * - GET    /api/tags/:id                     - Get single tag with task relations
 * - PATCH  /api/tags/:id                     - Update tag (partial)
 * - DELETE /api/tags/:id                     - Delete tag (cascade deletes TaskTag entries)
 * - POST   /api/tags/tasks/:taskId/tags/:tagId   - Add tag to task
 * - DELETE /api/tags/tasks/:taskId/tags/:tagId   - Remove tag from task
 */
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * GET /api/tags
   *
   * Query params: workspace (WORK | PERSONAL)
   * Returns: Array of tags filtered by workspace, sorted by name ASC
   */
  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) filters: TagFilterDto) {
    return this.tagsService.findAll(filters);
  }

  /**
   * POST /api/tags
   *
   * Body: { name, color, workspaces }
   * Returns: Created tag
   * Throws: 409 if tag name already exists
   */
  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  /**
   * GET /api/tags/:id
   *
   * Returns: Single tag with task relations
   * Throws: 404 if not found
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findOne(id);
  }

  /**
   * PATCH /api/tags/:id
   *
   * Body: Partial tag update (name?, color?, workspaces?)
   * Returns: Updated tag
   * Throws: 404 if not found, 409 if new name conflicts
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagsService.update(id, updateTagDto);
  }

  /**
   * DELETE /api/tags/:id
   *
   * Returns: Deleted tag
   * Throws: 404 if not found
   * Note: Cascade deletes all TaskTag associations
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }

  /**
   * POST /api/tags/tasks/:taskId/tags/:tagId
   *
   * Add a tag to a task (create TaskTag association)
   * Returns: 204 No Content on success
   * Throws: 404 if task or tag not found, 409 if already associated
   */
  @Post('tasks/:taskId/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  addTagToTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.tagsService.addTagToTask(taskId, tagId);
  }

  /**
   * DELETE /api/tags/tasks/:taskId/tags/:tagId
   *
   * Remove a tag from a task (delete TaskTag association)
   * Returns: 204 No Content on success
   * Throws: 404 if association doesn't exist
   */
  @Delete('tasks/:taskId/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTagFromTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.tagsService.removeTagFromTask(taskId, tagId);
  }
}
