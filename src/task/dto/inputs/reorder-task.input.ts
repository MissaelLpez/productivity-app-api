import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class NewOrderInput {
  @Field(() => Int, { nullable: false })
  id: number;

  @Field(() => Int, { nullable: false })
  list_number: number;
}
