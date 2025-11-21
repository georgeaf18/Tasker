import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksModule } from '../tasks/tasks.module';
import { TagsModule } from '../tags/tags.module';
import { SubtasksModule } from '../subtasks/subtasks.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, PrismaModule, TasksModule, TagsModule, SubtasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
