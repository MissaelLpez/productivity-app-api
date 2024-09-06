import {
  Field,
  Float,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Status } from '@prisma/client';

// Define la entidad para la tarea
@ObjectType()
export class Task {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Status)
  status: Status;

  @Field(() => String)
  defined_time: string;

  @Field(() => String)
  redefined_time: string;

  @Field(() => String, { nullable: true })
  remaining_time: string;

  @Field(() => Date, { nullable: true })
  started_at?: Date;

  @Field(() => Date, { nullable: true })
  finish_in?: Date;

  @Field(() => Date, { nullable: true })
  completed_at?: Date;

  @Field(() => Date, { nullable: true })
  paused_in?: Date;

  @Field(() => Int)
  list_number: number;
}

registerEnumType(Status, {
  name: 'Status',
});

// Define la entidad para clasificar las tareas
@ObjectType()
export class TaskCategories {
  @Field(() => Int)
  short: number;

  @Field(() => Int)
  medium: number;

  @Field(() => Int)
  long: number;
}

// Define la entidad para los días con conteo
@ObjectType()
export class DayCount {
  @Field(() => String)
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class WeekStats {
  @Field(() => String)
  weekStart: string;

  @Field(() => [DayCount])
  days: DayCount[];
}

@ObjectType()
export class Stats {
  @Field(() => Task)
  shortestTask: Task;

  @Field(() => Task)
  longestTask: Task;

  @Field(() => Float)
  averageCompletionTime: number;

  @Field(() => TaskCategories)
  taskCategories: TaskCategories;

  @Field(() => [WeekStats])
  tasksCompletedByWeek: WeekStats[];
}
