import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateTaskInput } from './dto/inputs/create-task.input';
import { NewOrderInput } from './dto/inputs/reorder-task.input';
import { UpdateTaskInput } from './dto/inputs/update-task.input';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(): Promise<Task[]> {
    return this.prisma.task.findMany({ orderBy: { list_number: 'asc' } });
  }

  async getTaskById(taskId: number): Promise<Task> {
    return this.prisma.task.findFirst({ where: { id: taskId } });
  }

  async createTask(taskInput: CreateTaskInput): Promise<Task> {
    return this.prisma.task.create({ data: taskInput });
  }

  async updateTask(taskInput: UpdateTaskInput): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskInput.id },
    });

    if (
      taskInput.status === 'continuing' ||
      taskInput.status === 'in_progress'
    ) {
      const date = new Date();

      const newFinishDate = new Date(
        Number(date) + Number(task.redefined_time),
      );

      return this.prisma.task.update({
        data: {
          ...taskInput,
          finish_in: newFinishDate,
        },
        where: { id: taskInput.id },
      });
    }

    return this.prisma.task.update({
      data: taskInput,
      where: { id: taskInput.id },
    });
  }

  async reorderTasks(newOrder: NewOrderInput[]): Promise<Task[]> {
    const trx = newOrder.map((task) =>
      this.prisma.task.update({
        where: { id: task.id },
        data: { list_number: task.list_number },
      }),
    );

    return this.prisma.$transaction(trx);
  }

  async deleteTask(taskId: number): Promise<Task> {
    return this.prisma.task.delete({ where: { id: taskId } });
  }
}
