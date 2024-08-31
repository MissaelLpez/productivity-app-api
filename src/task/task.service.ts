import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateTaskInput } from './dto/inputs/create-task.input';
import { UpdateTaskInput } from './dto/inputs/update-task.input';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(): Promise<Task[]> {
    return this.prisma.task.findMany();
  }

  async getTaskById(taskId: number): Promise<Task> {
    return this.prisma.task.findFirst({ where: { id: taskId } });
  }

  async createTask(taskInput: CreateTaskInput): Promise<Task> {
    return this.prisma.task.create({ data: taskInput });
  }

  async updateTask(taskInput: UpdateTaskInput): Promise<Task> {
    return this.prisma.task.update({
      data: taskInput,
      where: { id: taskInput.id },
    });
  }

  async deleteTask(taskId: number): Promise<Task> {
    return this.prisma.task.delete({ where: { id: taskId } });
  }
}
