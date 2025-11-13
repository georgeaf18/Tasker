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
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';

/**
 * TasksController
 *
 * REST API endpoints for task management.
 * All routes prefixed with /api/tasks (global prefix + controller route).
 *
 * Endpoints:
 * - GET    /api/tasks       - List tasks with optional filters
 * - POST   /api/tasks       - Create new task
 * - GET    /api/tasks/:id   - Get single task
 * - PATCH  /api/tasks/:id   - Update task (partial)
 * - DELETE /api/tasks/:id   - Delete task
 */
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * GET /api/tasks
   *
   * Query params: workspace (WORK | PERSONAL), status (BACKLOG | TODAY | IN_PROGRESS | DONE), channelId
   * Returns: Array of tasks with channel relation, sorted by createdAt DESC
   */
  @Get()
  findAll(@Query(new ValidationPipe({ transform: true })) filters: TaskFilterDto) {
    return this.tasksService.findAll(filters);
  }

  /**
   * POST /api/tasks
   *
   * Body: { title, description?, workspace, channelId?, status?, dueDate?, isRoutine? }
   * Returns: Created task with channel relation
   */
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  /**
   * GET /api/tasks/:id
   *
   * Returns: Single task with channel relation
   * Throws: 404 if not found
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  /**
   * PATCH /api/tasks/:id
   *
   * Body: Partial task update (any fields from CreateTaskDto)
   * Common use: Update status when dragging between kanban columns
   * Returns: Updated task with channel relation
   * Throws: 404 if not found
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto
  ) {
    return this.tasksService.update(id, updateTaskDto);
  }

  /**
   * DELETE /api/tasks/:id
   *
   * Returns: Deleted task
   * Throws: 404 if not found
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
