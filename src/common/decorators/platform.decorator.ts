import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Platform } from '../constants/platform';

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
