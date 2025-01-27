import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import dayjs from 'dayjs';
import { NextFunction } from 'express';
import helmet from 'helmet';
import { uuidv7 } from 'uuidv7';
import { AppModule } from './app.module';
import { HeadersKey } from './common/constants/headers';
import { ResponseTransformInterceptor } from './common/interceptors/response.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { HttpExceptionFilter } from './common/pipes/httpException.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.headers[HeadersKey.RequestId] = uuidv7();
    req.headers[HeadersKey.Timestamp] = dayjs().valueOf();
    next();
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  app.use(helmet());

  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(),
    new TimeoutInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
