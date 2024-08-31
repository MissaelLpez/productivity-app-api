import { Module } from '@nestjs/common';
import { Query } from '@nestjs/graphql';
import { HelloWorldResolver } from './hello-world.resolver';

@Module({
  providers: [HelloWorldResolver],
})
export class HelloWorldModule {
  @Query(() => String)
  helloWorld(): string {
    return 'Hello World!!!';
  }
}
