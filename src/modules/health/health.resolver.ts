/* eslint-disable @typescript-eslint/require-await */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateHealthCheckDto } from './dto/create.dto';
import { HealthCheck } from './entities/health.entity';
import { HealthService } from './health.service';

@Resolver(() => HealthCheck)
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}

  @Query(() => [HealthCheck])
  async getHealthCheck() {
    return this.healthService.getHealthCheck();
  }

  @Mutation(() => Boolean)
  createHealthCheck(
    @Args() createHealthCheckDto: CreateHealthCheckDto,
  ): boolean {
    console.log(createHealthCheckDto);
    return true;
  }
}
