import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { ReorderSubtaskDto } from './dto/reorder-subtask.dto';

/**
 * SubtasksController
 *
 * REST API endpoints for subtask management.
 * All routes prefixed with /api/subtasks or /api/tasks/:taskId/subtasks.
 *
 * Endpoints:
 * - GET    /api/tasks/:taskId/subtasks    - List all subtasks for a task
 * - POST   /api/tasks/:taskId/subtasks    - Create new subtask
 * - PATCH  /api/subtasks/:id              - Update subtask (title, status, position)
 * - PATCH  /api/subtasks/:id/reorder      - Reorder subtask (drag-and-drop)
 * - DELETE /api/subtasks/:id              - Delete subtask
 */
@ApiTags('subtasks')
@Controller()
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  /**
   * GET /api/tasks/:taskId/subtasks
   *
   * Returns: Array of subtasks with task relation, sorted by position ASC
   * Throws: 404 if parent task not found
   */
  @Get('tasks/:taskId/subtasks')
  @ApiOperation({
    summary: 'Get all subtasks for a parent task',
    description: 'Returns all subtasks for the specified task, ordered by position',
  })
  @ApiParam({
    name: 'taskId',
    type: 'number',
    description: 'Parent task ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of subtasks retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Parent task not found',
  })
  findAll(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.subtasksService.findAllByTask(taskId);
  }

  /**
   * POST /api/tasks/:taskId/subtasks
   *
   * Body: { title, position? }
   * Returns: Created subtask with task relation
   * Throws: 404 if parent task not found
   */
  @Post('tasks/:taskId/subtasks')
  @ApiOperation({
    summary: 'Create a new subtask',
    description: 'Creates a new subtask for the specified parent task',
  })
  @ApiParam({
    name: 'taskId',
    type: 'number',
    description: 'Parent task ID',
  })
  @ApiBody({
    type: CreateSubtaskDto,
    description: 'Subtask data (title required, position optional)',
  })
  @ApiResponse({
    status: 201,
    description: 'Subtask created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Parent task not found',
  })
  create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() createSubtaskDto: CreateSubtaskDto,
  ) {
    return this.subtasksService.create(taskId, createSubtaskDto);
  }

  /**
   * PATCH /api/subtasks/:id
   *
   * Body: Partial { title?, status?, position? }
   * Returns: Updated subtask with task relation
   * Throws: 404 if subtask not found
   */
  @Patch('subtasks/:id')
  @ApiOperation({
    summary: 'Update a subtask',
    description: 'Updates subtask title, status, or position (partial update)',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Subtask ID',
  })
  @ApiBody({
    type: UpdateSubtaskDto,
    description: 'Partial subtask update (all fields optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Subtask updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subtask not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
  ) {
    return this.subtasksService.update(id, updateSubtaskDto);
  }

  /**
   * PATCH /api/subtasks/:id/reorder
   *
   * Body: { position }
   * Returns: Updated subtask with task relation
   * Throws: 404 if subtask not found
   */
  @Patch('subtasks/:id/reorder')
  @ApiOperation({
    summary: 'Reorder a subtask',
    description: 'Updates subtask position for drag-and-drop reordering',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Subtask ID',
  })
  @ApiBody({
    type: ReorderSubtaskDto,
    description: 'New position for the subtask',
  })
  @ApiResponse({
    status: 200,
    description: 'Subtask reordered successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subtask not found',
  })
  reorder(
    @Param('id', ParseIntPipe) id: number,
    @Body() reorderSubtaskDto: ReorderSubtaskDto,
  ) {
    return this.subtasksService.reorder(id, reorderSubtaskDto);
  }

  /**
   * DELETE /api/subtasks/:id
   *
   * Returns: Deleted subtask
   * Throws: 404 if subtask not found
   */
  @Delete('subtasks/:id')
  @ApiOperation({
    summary: 'Delete a subtask',
    description: 'Permanently deletes a subtask',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Subtask ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Subtask deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Subtask not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subtasksService.remove(id);
  }
}
