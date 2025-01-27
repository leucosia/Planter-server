/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HeadersKey } from '../constants/headers';
import {
  ErrorResponseInterface,
  SuccessResponseInterface,
} from '../types/response';
import { Request } from 'express';
import { ErrorCode } from '../constants/error';
import dayjs from 'dayjs';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();

    const {
      [HeadersKey.RequestId]: requestId,
      [HeadersKey.Timestamp]: timestamp = dayjs().valueOf(),
    } = request.headers;
    context.switchToHttp().getResponse().statusCode = 200;

    return next.handle().pipe(
      map((data) => {
        return {
          data,
          requestId,
          timestamp,
          path: request.path,
          code: 200,
        } as SuccessResponseInterface<typeof data>;
      }),
      catchError((err) => {
        const error: Error = (err as unknown as any)?.response ?? err;
        const message = error.message;
        return [
          {
            requestId,
            code: error.name in ErrorCode ? ErrorCode[error.name] : -1,
            timestamp,
            message,
            path: request.path,
          } as ErrorResponseInterface,
        ];
      }),
    );
  }
}
