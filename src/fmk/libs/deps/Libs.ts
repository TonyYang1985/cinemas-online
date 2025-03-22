export * as ct from 'class-transformer';
export * as cv from 'class-validator';
export * as api from 'routing-controllers-openapi';
export * as ws from 'socket-controllers';
export * as di from 'typedi';
export * as orm from 'typeorm';
export * as tx from 'typeorm-transactional-cls-hooked';
export * as repo from 'typeorm-typedi-extensions';
import ctl from 'routing-controllers';
//eslint-disable-next-line @typescript-eslint/no-require-imports
export const rest = { ...require('routing-controllers') } as typeof ctl;

const _body = rest.Body;
rest.Body = (options?: any) => {
  if (options && options.transform && options.transform.excludeExtraneousValues !== false) {
    options.transform.excludeExtraneousValues = true;
  }
  if (!options) {
    options = { transform: { excludeExtraneousValues: true } };
  }
  return _body(options);
};
