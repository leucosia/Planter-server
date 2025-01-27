import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Platform } from '../constants/platform';

/**
 * header에 있는 user-agent를 통해 Platform을 추춣하는 데코레이터
 *
 * @returns `Platform` enum
 */
export const RequestPlatform = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    const userAgent = request.headers['user-agent'] ?? '';
    if (userAgent.includes('Android')) {
      return 'Android' as Platform;
    } else if (userAgent.includes('iPhone')) {
      return 'iOS' as Platform;
    } else {
      return 'Unknown' as Platform;
    }
  },
);
