import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Length } from 'class-validator';

@ArgsType()
export class CreateHealthCheckDto {
  @Field(() => Int)
  @IsInt()
  id: number;

  @Field(() => String)
  @IsString()
  @Length(2, 10)
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  test?: 'qwer' | 'asdf' | 'zxcv';
}
