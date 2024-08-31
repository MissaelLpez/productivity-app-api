import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TaskResolver } from './task.resolver';
import { TaskService } from './task.service';

@Module({
  providers: [TaskService, TaskResolver, PrismaService],
})
export class TaskModule {}
