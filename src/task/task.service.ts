import { Injectable } from '@nestjs/common';
import { Status, Task } from '@prisma/client';
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
      } else if (
        task.completionTime > 1800000 &&
        task.completionTime <= 3600000
      ) {
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

  async createManyTasks(): Promise<string> {
    const tasks = [
      {
        name: 'Probar funcionamiento App',
        description: 'Probar funcionamiento de la app',
        status: Status.todo,
        defined_time: '1800000', // 15 minutos
        redefined_time: '1800000',
        remaining_time: null,
        started_at: null,
        completed_at: null,
        paused_in: null,
      },
      {
        name: 'Eliminar Tarea',
        description: 'Opción para eliminar una tarea',
        status: Status.completed,
        defined_time: '900000', // 15 minutos
        redefined_time: '900000',
        remaining_time: '0',
        started_at: '2024-09-01T08:00:00.000Z',
        completed_at: '2024-09-01T08:15:00.000Z',
        paused_in: null,
      },
      {
        name: 'Añadir Nueva Funcionalidad',
        description: 'Implementar una nueva característica en la app',
        status: Status.completed,
        defined_time: '1800000', // 30 minutos
        redefined_time: '1800000',
        remaining_time: '0',
        started_at: '2024-09-01T09:00:00.000Z',
        completed_at: '2024-09-01T09:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Revisar Código',
        description: 'Realizar una revisión de código de la última entrega',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '0',
        started_at: '2024-09-01T10:00:00.000Z',
        completed_at: '2024-09-01T11:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Actualizar Documentación',
        description: 'Actualizar la documentación del proyecto',
        status: Status.completed,
        defined_time: '7200000', // 120 minutos
        redefined_time: '7200000',
        remaining_time: '0',
        started_at: '2024-09-01T13:00:00.000Z',
        completed_at: '2024-09-01T15:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Corrección de Errores',
        description: 'Corregir errores reportados por los usuarios',
        status: Status.completed,
        defined_time: '1500000', // 25 minutos
        redefined_time: '1500000',
        remaining_time: '300000', // 5 minutos
        started_at: '2024-09-01T15:30:00.000Z',
        completed_at: '2024-09-01T16:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Optimizar Consultas de Base de Datos',
        description:
          'Mejorar el rendimiento de las consultas a la base de datos',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '720000', // 12 minutos
        started_at: '2024-09-02T09:00:00.000Z',
        completed_at: '2024-09-02T10:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Refactorizar Código de la API',
        description:
          'Refactorizar el código de la API para mejor mantenimiento',
        status: Status.completed,
        defined_time: '5400000', // 90 minutos
        redefined_time: '5400000',
        remaining_time: '1080000', // 18 minutos
        started_at: '2024-09-02T11:00:00.000Z',
        completed_at: '2024-09-02T12:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Pruebas Unitarias',
        description: 'Escribir y ejecutar pruebas unitarias',
        status: Status.completed,
        defined_time: '1800000', // 30 minutos
        redefined_time: '1800000',
        remaining_time: '0',
        started_at: '2024-09-02T13:00:00.000Z',
        completed_at: '2024-09-02T13:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Diseño de Interfaz de Usuario',
        description: 'Crear el diseño para la nueva interfaz de usuario',
        status: Status.completed,
        defined_time: '7200000', // 120 minutos
        redefined_time: '7200000',
        remaining_time: '0',
        started_at: '2024-09-02T14:00:00.000Z',
        completed_at: '2024-09-02T16:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Revisar Seguridad del Sistema',
        description: 'Realizar una auditoría de seguridad en el sistema',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '720000', // 12 minutos
        started_at: '2024-09-03T09:00:00.000Z',
        completed_at: '2024-09-03T10:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Actualizar Dependencias',
        description: 'Actualizar las dependencias del proyecto',
        status: Status.completed,
        defined_time: '1500000', // 25 minutos
        redefined_time: '1500000',
        remaining_time: '0',
        started_at: '2024-09-03T11:00:00.000Z',
        completed_at: '2024-09-03T11:25:00.000Z',
        paused_in: null,
      },
      {
        name: 'Planificar la Próxima Iteración',
        description: 'Planificar las tareas para la próxima iteración',
        status: Status.completed,
        defined_time: '1800000', // 30 minutos
        redefined_time: '1800000',
        remaining_time: '0',
        started_at: '2024-09-03T12:00:00.000Z',
        completed_at: '2024-09-03T12:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Revisión de Requerimientos',
        description: 'Revisar y actualizar los requerimientos del proyecto',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '0',
        started_at: '2024-09-03T13:00:00.000Z',
        completed_at: '2024-09-03T14:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Desplegar a Producción',
        description: 'Desplegar la nueva versión a producción',
        status: Status.completed,
        defined_time: '7200000', // 120 minutos
        redefined_time: '7200000',
        remaining_time: '0',
        started_at: '2024-09-04T09:00:00.000Z',
        completed_at: '2024-09-04T11:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Configurar Base de Datos',
        description: 'Configurar la base de datos para el nuevo entorno',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '720000', // 12 minutos
        started_at: '2024-09-04T11:30:00.000Z',
        completed_at: '2024-09-04T12:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Realizar Backup',
        description: 'Hacer una copia de seguridad de la base de datos',
        status: Status.completed,
        defined_time: '1500000', // 25 minutos
        redefined_time: '1500000',
        remaining_time: '300000', // 5 minutos
        started_at: '2024-09-04T13:00:00.000Z',
        completed_at: '2024-09-04T13:25:00.000Z',
        paused_in: null,
      },
      {
        name: 'Optimizar Rendimiento',
        description: 'Mejorar el rendimiento general del sistema',
        status: Status.completed,
        defined_time: '5400000', // 90 minutos
        redefined_time: '5400000',
        remaining_time: '1080000', // 18 minutos
        started_at: '2024-09-04T14:00:00.000Z',
        completed_at: '2024-09-04T15:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Actualizar Interfaz de Usuario',
        description: 'Actualizar la interfaz de usuario con nuevos elementos',
        status: Status.completed,
        defined_time: '1800000', // 30 minutos
        redefined_time: '1800000',
        remaining_time: '0',
        started_at: '2024-09-05T09:00:00.000Z',
        completed_at: '2024-09-05T09:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Revisar Feedback de Usuarios',
        description: 'Revisar y analizar el feedback de los usuarios',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '720000', // 12 minutos
        started_at: '2024-09-05T10:00:00.000Z',
        completed_at: '2024-09-05T11:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Implementar Nuevas Funciones',
        description: 'Agregar nuevas funciones solicitadas',
        status: Status.completed,
        defined_time: '7200000', // 120 minutos
        redefined_time: '7200000',
        remaining_time: '0',
        started_at: '2024-09-05T11:30:00.000Z',
        completed_at: '2024-09-05T13:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Actualizar Sistema de Notificaciones',
        description: 'Actualizar el sistema de notificaciones del proyecto',
        status: Status.completed,
        defined_time: '1800000', // 30 minutos
        redefined_time: '1800000',
        remaining_time: '0',
        started_at: '2024-09-06T09:00:00.000Z',
        completed_at: '2024-09-06T09:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Revisar Logs de Error',
        description: 'Revisar los logs de errores y corregir problemas',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '0',
        started_at: '2024-09-06T10:00:00.000Z',
        completed_at: '2024-09-06T11:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Preparar Presentación de Proyecto',
        description: 'Preparar la presentación para la revisión del proyecto',
        status: Status.completed,
        defined_time: '5400000', // 90 minutos
        redefined_time: '5400000',
        remaining_time: '1080000', // 18 minutos
        started_at: '2024-09-06T11:30:00.000Z',
        completed_at: '2024-09-06T13:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Crear Documentación Técnica',
        description: 'Crear y actualizar la documentación técnica del proyecto',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '0',
        started_at: '2024-09-06T14:00:00.000Z',
        completed_at: '2024-09-06T15:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Revisar Nuevas Funcionalidades',
        description:
          'Revisar y validar las nuevas funcionalidades implementadas',
        status: Status.completed,
        defined_time: '1500000', // 25 minutos
        redefined_time: '1500000',
        remaining_time: '300000', // 5 minutos
        started_at: '2024-09-07T09:00:00.000Z',
        completed_at: '2024-09-07T09:25:00.000Z',
        paused_in: null,
      },
      {
        name: 'Revisión Final del Proyecto',
        description:
          'Revisión final y pruebas del proyecto antes de lanzamiento',
        status: Status.completed,
        defined_time: '7200000', // 120 minutos
        redefined_time: '7200000',
        remaining_time: '0',
        started_at: '2024-09-07T09:30:00.000Z',
        completed_at: '2024-09-07T11:30:00.000Z',
        paused_in: null,
      },
      {
        name: 'Actualizar Configuración del Servidor',
        description: 'Actualizar la configuración del servidor para producción',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '720000', // 12 minutos
        started_at: '2024-09-07T12:00:00.000Z',
        completed_at: '2024-09-07T13:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Configuración de Seguridad',
        description:
          'Configurar las medidas de seguridad para el nuevo entorno',
        status: Status.completed,
        defined_time: '1800000', // 30 minutos
        redefined_time: '1800000',
        remaining_time: '0',
        started_at: '2024-09-07T13:30:00.000Z',
        completed_at: '2024-09-07T14:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Ajustes en la Base de Datos',
        description: 'Realizar ajustes necesarios en la base de datos',
        status: Status.completed,
        defined_time: '5400000', // 90 minutos
        redefined_time: '5400000',
        remaining_time: '1080000', // 18 minutos
        started_at: '2024-09-07T14:30:00.000Z',
        completed_at: '2024-09-07T16:00:00.000Z',
        paused_in: null,
      },
      {
        name: 'Verificación Final del Sistema',
        description: 'Verificar el sistema completo antes de entrega',
        status: Status.completed,
        defined_time: '3600000', // 60 minutos
        redefined_time: '3600000',
        remaining_time: '0',
        started_at: '2024-09-07T16:30:00.000Z',
        completed_at: '2024-09-07T17:30:00.000Z',
        paused_in: null,
      },
    ];

    await this.prisma.task.createMany({ data: tasks });
    return 'success';
  }
}
