import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { Task } from '@prisma/client';

/**
 * TasksService
 *
 * Business logic layer for task CRUD operations.
 * Uses PrismaService for database access with proper error handling.
 * Always includes channel relation to prevent N+1 queries.
 */
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all tasks with optional filtering.
   *
   * @param filters - Optional workspace, status, or channelId filters
   * @returns Array of tasks with channel relation, sorted by createdAt DESC
   */
  async findAll(filters: TaskFilterDto): Promise<Task[]> {
    const where: any = {};

    if (filters.workspace) {
      where.workspace = filters.workspace;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.channelId !== undefined) {
      where.channelId = filters.channelId;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        channel: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find a single task by ID.
   *
   * @param id - Task ID
   * @returns Task with channel relation
   * @throws NotFoundException if task doesn't exist
   */
  async findOne(id: number): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        channel: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Create a new task.
   *
   * @param createTaskDto - Task data with validation
   * @returns Created task with channel relation
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const taskData: any = {
      title: createTaskDto.title,
      workspace: createTaskDto.workspace,
    };

    if (createTaskDto.description !== undefined) {
      taskData.description = createTaskDto.description;
    }

    if (createTaskDto.channelId !== undefined && createTaskDto.channelId !== null) {
      taskData.channelId = createTaskDto.channelId;
    }

    if (createTaskDto.status !== undefined) {
      taskData.status = createTaskDto.status;
    }

    if (createTaskDto.dueDate !== undefined) {
      taskData.dueDate = new Date(createTaskDto.dueDate);
    }

    if (createTaskDto.isRoutine !== undefined) {
      taskData.isRoutine = createTaskDto.isRoutine;
    }

    return this.prisma.task.create({
      data: taskData,
      include: {
        channel: true,
      },
    });
  }

  /**
   * Update an existing task.
   *
   * @param id - Task ID
   * @param updateTaskDto - Partial task data to update
   * @returns Updated task with channel relation
   * @throws NotFoundException if task doesn't exist
   */
  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // Verify task exists first
    await this.findOne(id);

    const updateData: any = {};

    if (updateTaskDto.title !== undefined) {
      updateData.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      updateData.description = updateTaskDto.description;
    }

    if (updateTaskDto.workspace !== undefined) {
      updateData.workspace = updateTaskDto.workspace;
    }

    if (updateTaskDto.channelId !== undefined) {
      updateData.channelId = updateTaskDto.channelId;
    }

    if (updateTaskDto.status !== undefined) {
      updateData.status = updateTaskDto.status;
    }

    if (updateTaskDto.dueDate !== undefined) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }

    if (updateTaskDto.isRoutine !== undefined) {
      updateData.isRoutine = updateTaskDto.isRoutine;
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        channel: true,
      },
    });
  }

  /**
   * Delete a task.
   *
   * @param id - Task ID
   * @returns Deleted task
   * @throws NotFoundException if task doesn't exist
   */
  async remove(id: number): Promise<Task> {
    // Verify task exists first
    await this.findOne(id);

    return this.prisma.task.delete({
      where: { id },
      include: {
        channel: true,
      },
    });
  }
}
