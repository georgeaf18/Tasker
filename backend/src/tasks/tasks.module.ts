import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

/**
 * TasksModule
 *
 * Encapsulates all task-related functionality.
 * PrismaService is automatically available via @Global PrismaModule.
 */
@Module({
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
