import { BadRequestException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Query(() => [Task])
  async getAllTasks(): Promise<Task[]> {
    return this.taskService.getAllTasks();
  }

  @Query(() => Task)
  async getTaskById(@Args('id') id: number): Promise<Task> {
    const task = await this.taskService.getTaskById(id);

    if (!task) {
      throw new BadRequestException(`Task with id ${id} not founded`);
    }

    return task;
  }
}
