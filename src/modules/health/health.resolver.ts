/* eslint-disable @typescript-eslint/require-await */
import { Query, Resolver } from '@nestjs/graphql';

@Resolver('HealthCheck')
export class HealthResolver {
  @Query()
  async getHealthCheck() {
    return [
      { id: 1, name: 'qwer' },
      { id: 2, name: 'test' },
    ];
  }
}
