import { Module } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { SubtasksController } from './subtasks.controller';

/**
 * SubtasksModule
 *
 * Encapsulates all subtask-related functionality.
 * PrismaService is automatically available via @Global PrismaModule.
 */
@Module({
  controllers: [SubtasksController],
  providers: [SubtasksService],
  exports: [SubtasksService],
})
export class SubtasksModule {}
