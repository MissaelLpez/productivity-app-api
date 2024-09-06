import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';
import {
  eachDayOfInterval,
  format,
  isAfter,
  isValid,
  startOfWeek,
} from 'date-fns';
import { PrismaService } from 'src/prisma.service';
import { CreateTaskInput } from './dto/inputs/create-task.input';
import { NewOrderInput } from './dto/inputs/reorder-task.input';
import { UpdateTaskInput } from './dto/inputs/update-task.input';
import { Stats } from './entities/task.entity';

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

  async getStats(): Promise<Stats> {
    const tasks = await this.prisma.task.findMany({
      where: { status: 'completed' },
    });

    const taskOrderByQuickly = tasks
      .map((task) => ({
        ...task,
        completionTime: Number(task.defined_time) - Number(task.remaining_time),
      }))
      .sort((a, b) => a.completionTime - b.completionTime);

    const totalCompletionTime = taskOrderByQuickly.reduce(
      (sum, task) => sum + task.completionTime,
      0,
    );
    const averageCompletionTime =
      totalCompletionTime / taskOrderByQuickly.length;

    const taskCategories = {
      short: 0,
      medium: 0,
      long: 0,
    };

    taskOrderByQuickly.forEach((task) => {
      if (task.completionTime <= 1800000) {
        taskCategories.short++;
      } else if (task.completionTime <= 2700000) {
        taskCategories.medium++;
      } else {
        taskCategories.long++;
      }
    });

    const today = new Date();
    const tasksCompletedByWeek: Record<
      string,
      { date: string; count: number }[]
    > = {};

    tasks.forEach((task) => {
      if (task.completed_at) {
        const completedDate = new Date(task.completed_at);

        if (!isValid(completedDate)) {
          console.warn(`Invalid completed_at date: ${task.completed_at}`);
          return;
        }

        const weekStart = format(startOfWeek(completedDate), 'yyyy-MM-dd');
        const day = format(completedDate, 'yyyy-MM-dd');

        if (!tasksCompletedByWeek[weekStart]) {
          const daysOfWeek = eachDayOfInterval({
            start: startOfWeek(completedDate),
            end: new Date(
              startOfWeek(completedDate).getTime() + 6 * 24 * 60 * 60 * 1000,
            ),
          }).filter((day) => !isAfter(day, today));

          tasksCompletedByWeek[weekStart] = daysOfWeek.map((d) => ({
            date: format(d, 'yyyy-MM-dd'),
            count: 0,
          }));
        }

        const existingDay = tasksCompletedByWeek[weekStart].find(
          (d) => d.date === day,
        );

        if (existingDay) {
          existingDay.count++;
        } else {
          tasksCompletedByWeek[weekStart].push({ date: day, count: 1 });
        }
      }
    });

    const stats = {
      shortestTask: taskOrderByQuickly[0],
      longestTask: taskOrderByQuickly[taskOrderByQuickly.length - 1],
      averageCompletionTime: averageCompletionTime,
      taskCategories: taskCategories,
      tasksCompletedByWeek: Object.entries(tasksCompletedByWeek).map(
        ([weekStart, days]) => ({
          weekStart,
          days: days.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          ),
        }),
      ),
    };

    return stats;
  }

  async deleteAllTasks(): Promise<string> {
    await this.prisma.task.deleteMany();
    return 'success';
  }
}
