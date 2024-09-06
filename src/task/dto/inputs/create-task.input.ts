import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateTaskInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field(() => String)
  @IsString()
  @MaxLength(300)
  description: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(7)
  defined_time: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(7)
  redefined_time: string;
}
