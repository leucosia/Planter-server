import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
  mixin,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { HealthService } from 'src/modules/health/health.service';

/**
 * AuthGuard 믹스인
 *
 * **테스트 코드**
 * - `@UseGuards(AuthGuard())` 데코레이터를 통해 사용 가능
 * -  ?auth=test 로 요청 시 통과, 쿼리에 있는 값을 통해 허용되는지 체크하는 코드
 */
const AuthGuard = (): Type<CanActivate> => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(
      private reflector: Reflector,
      private readonly healthService: HealthService,
    ) {}

    async canActivate(context: ExecutionContext) {
      const request: Request = context.switchToHttp().getRequest();

      const test = await this.healthService.getHealthCheck();

      return test.some((x) => x.name === request.query?.['auth']);
    }
  }

  return mixin(AuthGuardMixin);
};

export default AuthGuard;
