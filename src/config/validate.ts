/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DB_TYPE: TypeOrmModuleOptions['type'];
  @IsString()
  DB_HOST: string;
  @IsNumber()
  DB_PORT: number;
  @IsString()
  DB_USERNAME: string;
  @IsString()
  DB_PASSWORD: string;
  @IsString()
  DB_DATABASE: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  }) as EnvironmentVariables;
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
