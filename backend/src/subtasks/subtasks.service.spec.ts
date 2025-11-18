import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { SubtaskStatus } from '@prisma/client';

describe('SubtasksService', () => {
  let service: SubtasksService;
  let prisma: PrismaService;

  const mockPrismaService = {
    task: {
      findUnique: jest.fn(),
    },
    subtask: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SubtasksService>(SubtasksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByTask', () => {
    const taskId = 1;
    const mockTask = { id: taskId, title: 'Test Task' };
    const mockSubtasks = [
      {
        id: 1,
        taskId,
        title: 'Subtask 1',
        status: SubtaskStatus.TODO,
        position: 0,
        task: mockTask,
      },
      {
        id: 2,
        taskId,
        title: 'Subtask 2',
        status: SubtaskStatus.DONE,
        position: 1,
        task: mockTask,
      },
    ];

    it('should return all subtasks for a task, ordered by position', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subtask.findMany.mockResolvedValue(mockSubtasks);

      const result = await service.findAllByTask(taskId);

      expect(result).toEqual(mockSubtasks);
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(prisma.subtask.findMany).toHaveBeenCalledWith({
        where: { taskId },
        include: { task: true },
        orderBy: { position: 'asc' },
      });
    });

    it('should throw NotFoundException when parent task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.findAllByTask(taskId)).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
      expect(prisma.subtask.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const subtaskId = 1;
    const mockSubtask = {
      id: subtaskId,
      taskId: 1,
      title: 'Test Subtask',
      status: SubtaskStatus.TODO,
      position: 0,
      task: { id: 1, title: 'Test Task' },
    };

    it('should return a subtask by id', async () => {
      mockPrismaService.subtask.findUnique.mockResolvedValue(mockSubtask);

      const result = await service.findOne(subtaskId);

      expect(result).toEqual(mockSubtask);
      expect(prisma.subtask.findUnique).toHaveBeenCalledWith({
        where: { id: subtaskId },
        include: { task: true },
      });
    });

    it('should throw NotFoundException when subtask does not exist', async () => {
      mockPrismaService.subtask.findUnique.mockResolvedValue(null);

      await expect(service.findOne(subtaskId)).rejects.toThrow(
        new NotFoundException(`Subtask with ID ${subtaskId} not found`),
      );
    });
  });

  describe('create', () => {
    const taskId = 1;
    const mockTask = { id: taskId, title: 'Test Task' };
    const createDto = { title: 'New Subtask' };
    const mockCreatedSubtask = {
      id: 1,
      taskId,
      title: 'New Subtask',
      status: SubtaskStatus.TODO,
      position: 0,
      task: mockTask,
    };

    it('should create a subtask with auto-generated position', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subtask.aggregate.mockResolvedValue({
        _max: { position: 2 },
      });
      mockPrismaService.subtask.create.mockResolvedValue(mockCreatedSubtask);

      const result = await service.create(taskId, createDto);

      expect(result).toEqual(mockCreatedSubtask);
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(prisma.subtask.aggregate).toHaveBeenCalledWith({
        where: { taskId },
        _max: { position: true },
      });
      expect(prisma.subtask.create).toHaveBeenCalledWith({
        data: {
          taskId,
          title: 'New Subtask',
          position: 3,
          status: SubtaskStatus.TODO,
        },
        include: { task: true },
      });
    });

    it('should create a subtask with specified position', async () => {
      const createDtoWithPosition = { title: 'New Subtask', position: 5 };
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subtask.create.mockResolvedValue({
        ...mockCreatedSubtask,
        position: 5,
      });

      const result = await service.create(taskId, createDtoWithPosition);

      expect(result.position).toBe(5);
      expect(prisma.subtask.aggregate).not.toHaveBeenCalled();
      expect(prisma.subtask.create).toHaveBeenCalledWith({
        data: {
          taskId,
          title: 'New Subtask',
          position: 5,
          status: SubtaskStatus.TODO,
        },
        include: { task: true },
      });
    });

    it('should handle first subtask creation (no existing subtasks)', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);
      mockPrismaService.subtask.aggregate.mockResolvedValue({
        _max: { position: null },
      });
      mockPrismaService.subtask.create.mockResolvedValue(mockCreatedSubtask);

      await service.create(taskId, createDto);

      expect(prisma.subtask.create).toHaveBeenCalledWith({
        data: {
          taskId,
          title: 'New Subtask',
          position: 0,
          status: SubtaskStatus.TODO,
        },
        include: { task: true },
      });
    });

    it('should throw NotFoundException when parent task does not exist', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(service.create(taskId, createDto)).rejects.toThrow(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );
      expect(prisma.subtask.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const subtaskId = 1;
    const mockSubtask = {
      id: subtaskId,
      taskId: 1,
      title: 'Test Subtask',
      status: SubtaskStatus.TODO,
      position: 0,
      task: { id: 1, title: 'Test Task' },
    };

    it('should update subtask title', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedSubtask = { ...mockSubtask, title: 'Updated Title' };

      mockPrismaService.subtask.findUnique.mockResolvedValue(mockSubtask);
      mockPrismaService.subtask.update.mockResolvedValue(updatedSubtask);

      const result = await service.update(subtaskId, updateDto);

      expect(result).toEqual(updatedSubtask);
      expect(prisma.subtask.update).toHaveBeenCalledWith({
        where: { id: subtaskId },
        data: { title: 'Updated Title' },
        include: { task: true },
      });
    });

    it('should update subtask status and set completedAt when marking as DONE', async () => {
      const updateDto = { status: SubtaskStatus.DONE };
      const updatedSubtask = {
        ...mockSubtask,
        status: SubtaskStatus.DONE,
        completedAt: new Date(),
      };

      mockPrismaService.subtask.findUnique.mockResolvedValue(mockSubtask);
      mockPrismaService.subtask.update.mockResolvedValue(updatedSubtask);

      const result = await service.update(subtaskId, updateDto);

      expect(result.status).toBe(SubtaskStatus.DONE);
      expect(prisma.subtask.update).toHaveBeenCalledWith({
        where: { id: subtaskId },
        data: {
          status: SubtaskStatus.DONE,
          completedAt: expect.any(Date),
        },
        include: { task: true },
      });
    });

    it('should update subtask status and clear completedAt when moving from DONE to TODO', async () => {
      const doneSubtask = {
        ...mockSubtask,
        status: SubtaskStatus.DONE,
        completedAt: new Date(),
      };
      const updateDto = { status: SubtaskStatus.TODO };

      mockPrismaService.subtask.findUnique.mockResolvedValue(doneSubtask);
      mockPrismaService.subtask.update.mockResolvedValue({
        ...doneSubtask,
        status: SubtaskStatus.TODO,
        completedAt: null,
      });

      await service.update(subtaskId, updateDto);

      expect(prisma.subtask.update).toHaveBeenCalledWith({
        where: { id: subtaskId },
        data: {
          status: SubtaskStatus.TODO,
          completedAt: null,
        },
        include: { task: true },
      });
    });

    it('should update subtask position', async () => {
      const updateDto = { position: 5 };
      const updatedSubtask = { ...mockSubtask, position: 5 };

      mockPrismaService.subtask.findUnique.mockResolvedValue(mockSubtask);
      mockPrismaService.subtask.update.mockResolvedValue(updatedSubtask);

      const result = await service.update(subtaskId, updateDto);

      expect(result.position).toBe(5);
      expect(prisma.subtask.update).toHaveBeenCalledWith({
        where: { id: subtaskId },
        data: { position: 5 },
        include: { task: true },
      });
    });

    it('should update multiple fields at once', async () => {
      const updateDto = {
        title: 'Updated Title',
        status: SubtaskStatus.DOING,
        position: 3,
      };

      mockPrismaService.subtask.findUnique.mockResolvedValue(mockSubtask);
      mockPrismaService.subtask.update.mockResolvedValue({
        ...mockSubtask,
        ...updateDto,
        completedAt: null,
      });

      await service.update(subtaskId, updateDto);

      expect(prisma.subtask.update).toHaveBeenCalledWith({
        where: { id: subtaskId },
        data: {
          title: 'Updated Title',
          status: SubtaskStatus.DOING,
          position: 3,
          completedAt: null,
        },
        include: { task: true },
      });
    });

    it('should throw NotFoundException when subtask does not exist', async () => {
      const updateDto = { title: 'Updated Title' };
      mockPrismaService.subtask.findUnique.mockResolvedValue(null);

      await expect(service.update(subtaskId, updateDto)).rejects.toThrow(
        new NotFoundException(`Subtask with ID ${subtaskId} not found`),
      );
      expect(prisma.subtask.update).not.toHaveBeenCalled();
    });
  });

  describe('reorder', () => {
    const subtaskId = 1;
    const mockSubtask = {
      id: subtaskId,
      taskId: 1,
      title: 'Test Subtask',
      status: SubtaskStatus.TODO,
      position: 0,
      task: { id: 1, title: 'Test Task' },
    };

    it('should reorder a subtask to new position', async () => {
      const reorderDto = { position: 5 };
      const reorderedSubtask = { ...mockSubtask, position: 5 };

      mockPrismaService.subtask.findUnique.mockResolvedValue(mockSubtask);
      mockPrismaService.subtask.update.mockResolvedValue(reorderedSubtask);

      const result = await service.reorder(subtaskId, reorderDto);

      expect(result.position).toBe(5);
      expect(prisma.subtask.update).toHaveBeenCalledWith({
        where: { id: subtaskId },
        data: { position: 5 },
        include: { task: true },
      });
    });

    it('should throw NotFoundException when subtask does not exist', async () => {
      const reorderDto = { position: 5 };
      mockPrismaService.subtask.findUnique.mockResolvedValue(null);

      await expect(service.reorder(subtaskId, reorderDto)).rejects.toThrow(
        new NotFoundException(`Subtask with ID ${subtaskId} not found`),
      );
      expect(prisma.subtask.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const subtaskId = 1;
    const mockSubtask = {
      id: subtaskId,
      taskId: 1,
      title: 'Test Subtask',
      status: SubtaskStatus.TODO,
      position: 0,
      task: { id: 1, title: 'Test Task' },
    };

    it('should delete a subtask', async () => {
      mockPrismaService.subtask.findUnique.mockResolvedValue(mockSubtask);
      mockPrismaService.subtask.delete.mockResolvedValue(mockSubtask);

      const result = await service.remove(subtaskId);

      expect(result).toEqual(mockSubtask);
      expect(prisma.subtask.delete).toHaveBeenCalledWith({
        where: { id: subtaskId },
        include: { task: true },
      });
    });

    it('should throw NotFoundException when subtask does not exist', async () => {
      mockPrismaService.subtask.findUnique.mockResolvedValue(null);

      await expect(service.remove(subtaskId)).rejects.toThrow(
        new NotFoundException(`Subtask with ID ${subtaskId} not found`),
      );
      expect(prisma.subtask.delete).not.toHaveBeenCalled();
    });
  });
});
