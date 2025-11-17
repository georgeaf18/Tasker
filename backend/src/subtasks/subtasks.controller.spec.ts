import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { ReorderSubtaskDto } from './dto/reorder-subtask.dto';
import { SubtaskStatus } from '@prisma/client';

describe('SubtasksController', () => {
  let controller: SubtasksController;
  let service: SubtasksService;

  const mockSubtasksService = {
    findAllByTask: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    reorder: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubtasksController],
      providers: [
        {
          provide: SubtasksService,
          useValue: mockSubtasksService,
        },
      ],
    }).compile();

    controller = module.get<SubtasksController>(SubtasksController);
    service = module.get<SubtasksService>(SubtasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const taskId = 1;
    const mockSubtasks = [
      {
        id: 1,
        taskId,
        title: 'Subtask 1',
        status: SubtaskStatus.TODO,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
        task: { id: taskId, title: 'Test Task' },
      },
      {
        id: 2,
        taskId,
        title: 'Subtask 2',
        status: SubtaskStatus.DONE,
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: new Date(),
        task: { id: taskId, title: 'Test Task' },
      },
    ];

    it('should return an array of subtasks for a task', async () => {
      mockSubtasksService.findAllByTask.mockResolvedValue(mockSubtasks);

      const result = await controller.findAll(taskId);

      expect(result).toEqual(mockSubtasks);
      expect(service.findAllByTask).toHaveBeenCalledWith(taskId);
    });

    it('should propagate NotFoundException from service', async () => {
      mockSubtasksService.findAllByTask.mockRejectedValue(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );

      await expect(controller.findAll(taskId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findAllByTask).toHaveBeenCalledWith(taskId);
    });
  });

  describe('create', () => {
    const taskId = 1;
    const createDto: CreateSubtaskDto = {
      title: 'New Subtask',
    };
    const mockCreatedSubtask = {
      id: 1,
      taskId,
      title: 'New Subtask',
      status: SubtaskStatus.TODO,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      task: { id: taskId, title: 'Test Task' },
    };

    it('should create a new subtask', async () => {
      mockSubtasksService.create.mockResolvedValue(mockCreatedSubtask);

      const result = await controller.create(taskId, createDto);

      expect(result).toEqual(mockCreatedSubtask);
      expect(service.create).toHaveBeenCalledWith(taskId, createDto);
    });

    it('should create a subtask with specified position', async () => {
      const createDtoWithPosition: CreateSubtaskDto = {
        title: 'New Subtask',
        position: 5,
      };
      const mockCreatedSubtaskWithPosition = {
        ...mockCreatedSubtask,
        position: 5,
      };

      mockSubtasksService.create.mockResolvedValue(
        mockCreatedSubtaskWithPosition,
      );

      const result = await controller.create(taskId, createDtoWithPosition);

      expect(result.position).toBe(5);
      expect(service.create).toHaveBeenCalledWith(
        taskId,
        createDtoWithPosition,
      );
    });

    it('should propagate NotFoundException when parent task does not exist', async () => {
      mockSubtasksService.create.mockRejectedValue(
        new NotFoundException(`Task with ID ${taskId} not found`),
      );

      await expect(controller.create(taskId, createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.create).toHaveBeenCalledWith(taskId, createDto);
    });
  });

  describe('update', () => {
    const subtaskId = 1;
    const updateDto: UpdateSubtaskDto = {
      title: 'Updated Title',
      status: SubtaskStatus.DOING,
    };
    const mockUpdatedSubtask = {
      id: subtaskId,
      taskId: 1,
      title: 'Updated Title',
      status: SubtaskStatus.DOING,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      task: { id: 1, title: 'Test Task' },
    };

    it('should update a subtask', async () => {
      mockSubtasksService.update.mockResolvedValue(mockUpdatedSubtask);

      const result = await controller.update(subtaskId, updateDto);

      expect(result).toEqual(mockUpdatedSubtask);
      expect(service.update).toHaveBeenCalledWith(subtaskId, updateDto);
    });

    it('should update only title', async () => {
      const titleOnlyDto: UpdateSubtaskDto = { title: 'New Title Only' };
      mockSubtasksService.update.mockResolvedValue({
        ...mockUpdatedSubtask,
        title: 'New Title Only',
      });

      const result = await controller.update(subtaskId, titleOnlyDto);

      expect(result.title).toBe('New Title Only');
      expect(service.update).toHaveBeenCalledWith(subtaskId, titleOnlyDto);
    });

    it('should update only status', async () => {
      const statusOnlyDto: UpdateSubtaskDto = { status: SubtaskStatus.DONE };
      mockSubtasksService.update.mockResolvedValue({
        ...mockUpdatedSubtask,
        status: SubtaskStatus.DONE,
        completedAt: new Date(),
      });

      const result = await controller.update(subtaskId, statusOnlyDto);

      expect(result.status).toBe(SubtaskStatus.DONE);
      expect(service.update).toHaveBeenCalledWith(subtaskId, statusOnlyDto);
    });

    it('should update only position', async () => {
      const positionOnlyDto: UpdateSubtaskDto = { position: 3 };
      mockSubtasksService.update.mockResolvedValue({
        ...mockUpdatedSubtask,
        position: 3,
      });

      const result = await controller.update(subtaskId, positionOnlyDto);

      expect(result.position).toBe(3);
      expect(service.update).toHaveBeenCalledWith(subtaskId, positionOnlyDto);
    });

    it('should propagate NotFoundException when subtask does not exist', async () => {
      mockSubtasksService.update.mockRejectedValue(
        new NotFoundException(`Subtask with ID ${subtaskId} not found`),
      );

      await expect(controller.update(subtaskId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith(subtaskId, updateDto);
    });
  });

  describe('reorder', () => {
    const subtaskId = 1;
    const reorderDto: ReorderSubtaskDto = { position: 5 };
    const mockReorderedSubtask = {
      id: subtaskId,
      taskId: 1,
      title: 'Test Subtask',
      status: SubtaskStatus.TODO,
      position: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      task: { id: 1, title: 'Test Task' },
    };

    it('should reorder a subtask', async () => {
      mockSubtasksService.reorder.mockResolvedValue(mockReorderedSubtask);

      const result = await controller.reorder(subtaskId, reorderDto);

      expect(result).toEqual(mockReorderedSubtask);
      expect(result.position).toBe(5);
      expect(service.reorder).toHaveBeenCalledWith(subtaskId, reorderDto);
    });

    it('should reorder to position 0', async () => {
      const reorderToZero: ReorderSubtaskDto = { position: 0 };
      mockSubtasksService.reorder.mockResolvedValue({
        ...mockReorderedSubtask,
        position: 0,
      });

      const result = await controller.reorder(subtaskId, reorderToZero);

      expect(result.position).toBe(0);
      expect(service.reorder).toHaveBeenCalledWith(subtaskId, reorderToZero);
    });

    it('should propagate NotFoundException when subtask does not exist', async () => {
      mockSubtasksService.reorder.mockRejectedValue(
        new NotFoundException(`Subtask with ID ${subtaskId} not found`),
      );

      await expect(controller.reorder(subtaskId, reorderDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.reorder).toHaveBeenCalledWith(subtaskId, reorderDto);
    });
  });

  describe('remove', () => {
    const subtaskId = 1;
    const mockDeletedSubtask = {
      id: subtaskId,
      taskId: 1,
      title: 'Deleted Subtask',
      status: SubtaskStatus.TODO,
      position: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      task: { id: 1, title: 'Test Task' },
    };

    it('should delete a subtask', async () => {
      mockSubtasksService.remove.mockResolvedValue(mockDeletedSubtask);

      const result = await controller.remove(subtaskId);

      expect(result).toEqual(mockDeletedSubtask);
      expect(service.remove).toHaveBeenCalledWith(subtaskId);
    });

    it('should propagate NotFoundException when subtask does not exist', async () => {
      mockSubtasksService.remove.mockRejectedValue(
        new NotFoundException(`Subtask with ID ${subtaskId} not found`),
      );

      await expect(controller.remove(subtaskId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.remove).toHaveBeenCalledWith(subtaskId);
    });
  });
});
