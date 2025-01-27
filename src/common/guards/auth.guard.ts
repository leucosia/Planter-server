import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
  mixin,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import dayjs from 'dayjs';
import { Request } from 'express';
import { HeadersKey } from '../constants/headers';

const AuthGuard = (): Type<CanActivate> => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext) {
      const request: Request = context.switchToHttp().getRequest();
      const {
        [HeadersKey.RequestId]: requestId,
        [HeadersKey.Timestamp]: timestamp = dayjs().valueOf(),
      } = request.headers;

      const path = request.path;

      return true;
    }
  }

  return mixin(AuthGuardMixin);
};

export default AuthGuard;
