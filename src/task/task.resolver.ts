import { Query, Resolver } from '@nestjs/graphql';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Query(() => [Task])
  getAllTasks() {
    return this.taskService.getAllTasks();
  }
}
