/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { plainToClass } from 'class-transformer';
import { IsUrl, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsUrl({ protocols: ['http', 'https'] })
  DB_URL: string;
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
