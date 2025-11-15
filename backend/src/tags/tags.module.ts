import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';

/**
 * TagsModule
 *
 * Encapsulates all tag-related functionality including tag CRUD
 * and task-tag association management.
 * PrismaService is automatically available via @Global PrismaModule.
 */
@Module({
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
