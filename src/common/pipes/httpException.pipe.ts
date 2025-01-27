/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { ErrorCode } from '../constants/error';
import { HeadersKey } from '../constants/headers';
import { ErrorResponseInterface } from '../types/response';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();
    const request: Request = ctx.getRequest();
    const status = exception.getStatus();
    const {
      [HeadersKey.RequestId]: requestId,
      [HeadersKey.Timestamp]: timestamp = dayjs().valueOf(),
    } = request.headers;

    response.status(status).json({
      requestId,
      code: exception.name in ErrorCode ? ErrorCode[exception.name] : status,
      timestamp,
      message: exception.message,
      path: request.path,
    } as ErrorResponseInterface);
  }
}
