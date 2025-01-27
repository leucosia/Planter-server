/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HeadersKey } from 'src/common/constants/headers';
import { logger } from '../utils/log';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const {
      method,
      query,
      body,
      headers: {
        [HeadersKey.RequestId]: requestId,
        [HeadersKey.Timestamp]: timestamp,
      },
      path,
    } = req;

    logger(timestamp, requestId, method, path, query, body);

    const originalSend = res.send;
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const originalRedirect = res.redirect;

    res.send = function (responseBody) {
      const param = {
        statusCode: res.statusCode,
        response: responseBody,
      };

      logger(
        timestamp,
        requestId,
        method,
        path,
        `end ${Date.now() - Number(timestamp)}ms`,
        param,
      );
      res.send = originalSend;
      res.send(responseBody);
    }.bind(this);

    res.redirect = function (url: string) {
      logger(
        timestamp,
        requestId,
        method,
        path,
        `end ${Date.now() - Number(timestamp)}ms`,
        { redirect: url },
      );
      res.redirect = originalRedirect;
      res.redirect(url);
    }.bind(this);

    next?.();
  }
}
