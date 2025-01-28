/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: this.configService.get<string>(
        'DB_TYPE',
      ) as TypeOrmModuleOptions['type'] as any,
      host: this.configService.get<string>('DB_HOST'),
      port: +(this.configService.get<number>('DB_PORT') ?? 3306),
      username: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
      synchronize: true,
      logging: true,
      entities: [`${__dirname}/../**/entities/*.entity.{ts,js}`],
    };
  }
}
