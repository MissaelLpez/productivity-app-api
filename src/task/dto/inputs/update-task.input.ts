import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { Status } from '@prisma/client';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateTaskInput {
  @Field(() => Int, { nullable: false })
  id: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(300)
  description?: string;

  @Field(() => Status, { nullable: true })
  status: Status;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(7)
  defined_time: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @MaxLength(7)
  redefined_time: string;

  @Field(() => Date, { nullable: true })
  started_at?: Date;

  @Field(() => Date, { nullable: true })
  finish_in?: Date;

  @Field(() => Date, { nullable: true })
  completed_at?: Date;

  @Field(() => Date, { nullable: true })
  paused_in?: Date;
}

registerEnumType(Status, {
  name: 'Status',
});
