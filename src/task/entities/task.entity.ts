import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Status } from '@prisma/client';

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

  @Field(() => Date, { nullable: true })
  started_at?: Date;

  @Field(() => Date, { nullable: true })
  completed_at?: Date;

  @Field(() => String, { nullable: true })
  paused_in?: bigint;

  @Field(() => Int)
  list_number: number;
}

registerEnumType(Status, {
  name: 'Status',
});
