import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { ReorderSubtaskDto } from './dto/reorder-subtask.dto';
import { Subtask, SubtaskStatus } from '@prisma/client';

/**
 * SubtasksService
 *
 * Business logic layer for subtask CRUD operations.
 * Uses PrismaService for database access with proper error handling.
 * Always includes parent task relation to prevent N+1 queries.
 */
@Injectable()
export class SubtasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all subtasks for a parent task.
   *
   * @param taskId - Parent task ID
   * @returns Array of subtasks with task relation, sorted by position ASC
   * @throws NotFoundException if parent task doesn't exist
   */
  async findAllByTask(taskId: number): Promise<Subtask[]> {
    // Verify parent task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return this.prisma.subtask.findMany({
      where: { taskId },
      include: {
        task: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  /**
   * Find a single subtask by ID.
   *
   * @param id - Subtask ID
   * @returns Subtask with task relation
   * @throws NotFoundException if subtask doesn't exist
   */
  async findOne(id: number): Promise<Subtask> {
    const subtask = await this.prisma.subtask.findUnique({
      where: { id },
      include: {
        task: true,
      },
    });

    if (!subtask) {
      throw new NotFoundException(`Subtask with ID ${id} not found`);
    }

    return subtask;
  }

  /**
   * Create a new subtask for a parent task.
   *
   * @param taskId - Parent task ID
   * @param createSubtaskDto - Subtask data with validation
   * @returns Created subtask with task relation
   * @throws NotFoundException if parent task doesn't exist
   */
  async create(
    taskId: number,
    createSubtaskDto: CreateSubtaskDto,
  ): Promise<Subtask> {
    // Verify parent task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // If no position specified, append to end
    let position = createSubtaskDto.position;
    if (position === undefined) {
      const maxPosition = await this.prisma.subtask.aggregate({
        where: { taskId },
        _max: { position: true },
      });
      position = (maxPosition._max.position ?? -1) + 1;
    }

    const subtaskData: {
      taskId: number;
      title: string;
      position: number;
      status: SubtaskStatus;
    } = {
      taskId,
      title: createSubtaskDto.title,
      position,
      status: SubtaskStatus.TODO,
    };

    return this.prisma.subtask.create({
      data: subtaskData,
      include: {
        task: true,
      },
    });
  }

  /**
   * Update an existing subtask.
   *
   * @param id - Subtask ID
   * @param updateSubtaskDto - Partial subtask data to update
   * @returns Updated subtask with task relation
   * @throws NotFoundException if subtask doesn't exist
   */
  async update(
    id: number,
    updateSubtaskDto: UpdateSubtaskDto,
  ): Promise<Subtask> {
    // Verify subtask exists first
    await this.findOne(id);

    const updateData: {
      title?: string;
      status?: SubtaskStatus;
      position?: number;
      completedAt?: Date | null;
    } = {};

    if (updateSubtaskDto.title !== undefined) {
      updateData.title = updateSubtaskDto.title;
    }

    if (updateSubtaskDto.status !== undefined) {
      updateData.status = updateSubtaskDto.status;

      // Set completedAt timestamp when marking as DONE
      if (updateSubtaskDto.status === SubtaskStatus.DONE) {
        updateData.completedAt = new Date();
      } else {
        // Clear completedAt if moving back to TODO/DOING
        updateData.completedAt = null;
      }
    }

    if (updateSubtaskDto.position !== undefined) {
      updateData.position = updateSubtaskDto.position;
    }

    return this.prisma.subtask.update({
      where: { id },
      data: updateData,
      include: {
        task: true,
      },
    });
  }

  /**
   * Reorder a subtask (for drag-and-drop).
   *
   * @param id - Subtask ID
   * @param reorderSubtaskDto - New position
   * @returns Updated subtask with task relation
   * @throws NotFoundException if subtask doesn't exist
   */
  async reorder(
    id: number,
    reorderSubtaskDto: ReorderSubtaskDto,
  ): Promise<Subtask> {
    // Verify subtask exists first
    await this.findOne(id);

    return this.prisma.subtask.update({
      where: { id },
      data: {
        position: reorderSubtaskDto.position,
      },
      include: {
        task: true,
      },
    });
  }

  /**
   * Delete a subtask.
   *
   * @param id - Subtask ID
   * @returns Deleted subtask
   * @throws NotFoundException if subtask doesn't exist
   */
  async remove(id: number): Promise<Subtask> {
    // Verify subtask exists first
    await this.findOne(id);

    return this.prisma.subtask.delete({
      where: { id },
      include: {
        task: true,
      },
    });
  }
}
