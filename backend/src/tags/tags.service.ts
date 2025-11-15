import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagFilterDto } from './dto/tag-filter.dto';
import { Tag, Workspace } from '@prisma/client';

/**
 * TagsService
 *
 * Business logic layer for tag CRUD operations and task-tag associations.
 * Uses PrismaService for database access with proper error handling.
 * Prevents duplicate tag names and validates tag existence before operations.
 */
@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all tags with optional workspace filtering.
   *
   * @param filters - Optional workspace filter using Prisma array `has` operator
   * @returns Array of tags sorted by name ASC
   */
  async findAll(filters: TagFilterDto): Promise<Tag[]> {
    const where: {
      workspaces?: { has: Workspace };
    } = {};

    if (filters.workspace) {
      where.workspaces = { has: filters.workspace };
    }

    return this.prisma.tag.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Find a single tag by ID.
   *
   * @param id - Tag ID
   * @returns Tag with task relations
   * @throws NotFoundException if tag doesn't exist
   */
  async findOne(id: number): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        taskTags: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  /**
   * Create a new tag.
   *
   * @param createTagDto - Tag data with validation
   * @returns Created tag
   * @throws ConflictException if tag name already exists
   */
  async create(createTagDto: CreateTagDto): Promise<Tag> {
    // Check for duplicate tag name
    const existingTag = await this.prisma.tag.findUnique({
      where: { name: createTagDto.name },
    });

    if (existingTag) {
      throw new ConflictException(
        `Tag with name "${createTagDto.name}" already exists`,
      );
    }

    return this.prisma.tag.create({
      data: {
        name: createTagDto.name,
        color: createTagDto.color,
        workspaces: createTagDto.workspaces,
      },
    });
  }

  /**
   * Update an existing tag.
   *
   * @param id - Tag ID
   * @param updateTagDto - Partial tag data to update
   * @returns Updated tag
   * @throws NotFoundException if tag doesn't exist
   * @throws ConflictException if new name conflicts with existing tag
   */
  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    // Verify tag exists first
    await this.findOne(id);

    // Check for duplicate name if name is being updated
    if (updateTagDto.name) {
      const existingTag = await this.prisma.tag.findUnique({
        where: { name: updateTagDto.name },
      });

      if (existingTag && existingTag.id !== id) {
        throw new ConflictException(
          `Tag with name "${updateTagDto.name}" already exists`,
        );
      }
    }

    const updateData: {
      name?: string;
      color?: string;
      workspaces?: Workspace[];
    } = {};

    if (updateTagDto.name !== undefined) {
      updateData.name = updateTagDto.name;
    }

    if (updateTagDto.color !== undefined) {
      updateData.color = updateTagDto.color;
    }

    if (updateTagDto.workspaces !== undefined) {
      updateData.workspaces = updateTagDto.workspaces;
    }

    return this.prisma.tag.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a tag.
   *
   * @param id - Tag ID
   * @returns Deleted tag
   * @throws NotFoundException if tag doesn't exist
   *
   * Note: TaskTag entries are cascade deleted automatically via Prisma schema
   */
  async remove(id: number): Promise<Tag> {
    // Verify tag exists first
    await this.findOne(id);

    return this.prisma.tag.delete({
      where: { id },
    });
  }

  /**
   * Add a tag to a task (create TaskTag association).
   *
   * @param taskId - Task ID
   * @param tagId - Tag ID
   * @throws NotFoundException if task or tag doesn't exist
   * @throws ConflictException if association already exists
   */
  async addTagToTask(taskId: number, tagId: number): Promise<void> {
    // Verify task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Verify tag exists
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    // Check if association already exists
    const existingAssociation = await this.prisma.taskTag.findUnique({
      where: {
        taskId_tagId: {
          taskId,
          tagId,
        },
      },
    });

    if (existingAssociation) {
      throw new ConflictException(
        `Tag ${tagId} is already associated with task ${taskId}`,
      );
    }

    // Create association
    await this.prisma.taskTag.create({
      data: {
        taskId,
        tagId,
      },
    });
  }

  /**
   * Remove a tag from a task (delete TaskTag association).
   *
   * @param taskId - Task ID
   * @param tagId - Tag ID
   * @throws NotFoundException if association doesn't exist
   */
  async removeTagFromTask(taskId: number, tagId: number): Promise<void> {
    const association = await this.prisma.taskTag.findUnique({
      where: {
        taskId_tagId: {
          taskId,
          tagId,
        },
      },
    });

    if (!association) {
      throw new NotFoundException(
        `Tag ${tagId} is not associated with task ${taskId}`,
      );
    }

    await this.prisma.taskTag.delete({
      where: {
        taskId_tagId: {
          taskId,
          tagId,
        },
      },
    });
  }
}
