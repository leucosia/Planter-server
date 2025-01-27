/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsBoolean as OriginalIsBoolean } from 'class-validator';

/**
 * `class-validator` 의 `IsBoolean`은 제대로 동작하지 않기 때문에, 커스텀으로 사용합니다
 */
export function IsBoolean() {
  return applyDecorators(ToBoolean(), OriginalIsBoolean());
}

function ToBoolean() {
  const toPlain = Transform(
    ({ value }) => {
      return value;
    },
    {
      toPlainOnly: true,
    },
  );

  const toClass = (target: any, key: string) => {
    return Transform(
      ({ obj }) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return valueToBoolean(obj[key]);
      },
      {
        toClassOnly: true,
      },
    )(target, key);
  };
  return function (target: any, key: string) {
    toPlain(target, key);
    toClass(target, key);
  };
}

function valueToBoolean(value: any) {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (['true', 'on', 'yes', '1'].includes(value.toLowerCase())) {
      return true;
    }
    if (['false', 'off', 'no', '0'].includes(value.toLowerCase())) {
      return false;
    }
  }
  return undefined;
}
