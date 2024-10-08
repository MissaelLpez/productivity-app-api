import { BadRequestException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateTaskInput } from './dto/inputs/create-task.input';
import { NewOrderInput } from './dto/inputs/reorder-task.input';
import { UpdateTaskInput } from './dto/inputs/update-task.input';
import { Stats, Task } from './entities/task.entity';
import { TaskService } from './task.service';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Query(() => [Task])
  async getAllTasks(): Promise<Task[]> {
    return this.taskService.getAllTasks();
  }

  @Query(() => Task)
  async getTaskById(@Args('taskId') taskId: number): Promise<Task> {
    const task = await this.taskService.getTaskById(taskId);

    if (!task) {
      throw new BadRequestException(`Task with id ${taskId} not founded`);
    }

    return task;
  }

  @Mutation(() => Task)
  async createTask(
    @Args('createTaskInput') createTaskInput: CreateTaskInput,
  ): Promise<Task> {
    return this.taskService.createTask(createTaskInput);
  }

  @Mutation(() => Task)
  async updateTask(
    @Args('updateTaskInput') updateTaskInput: UpdateTaskInput,
  ): Promise<Task> {
    return this.taskService.updateTask(updateTaskInput);
  }

  @Mutation(() => [Task])
  async reorderTasks(
    @Args({ name: 'newOrder', type: () => [NewOrderInput] })
    newOrder: NewOrderInput[],
  ): Promise<Task[]> {
    return this.taskService.reorderTasks(newOrder);
  }

  @Mutation(() => Task)
  async deleteTask(@Args('taskId') taskId: number): Promise<Task> {
    return this.taskService.deleteTask(taskId);
  }

  @Query(() => Stats)
  async getStats(): Promise<Stats> {
    return this.taskService.getStats();
  }

  @Mutation(() => String)
  async deleteAllTasks(): Promise<string> {
    return this.taskService.deleteAllTasks();
  }

  @Mutation(() => String)
  async createManyTasks(): Promise<string> {
    return this.taskService.createManyTasks();
  }
}
