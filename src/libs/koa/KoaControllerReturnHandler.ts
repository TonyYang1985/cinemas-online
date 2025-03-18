import { ValidationError } from 'class-validator';
import { Context } from 'koa';
import { KoaMiddlewareInterface, Middleware, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { BizError } from '@footy/fmk/libs/error';
import { Logger } from '@footy/fmk/libs/logger';

const transformer = (errors: ValidationError[]) => {
  const err: Record<string, any> = {};
  errors.forEach((e) => {
    if (e.constraints) {
      err[e.property] = [];
      Object.values(e.constraints)
        .map((str) => {
          try {
            return JSON.parse(str);
          } catch (e) {
            return str;
          }
        })
        .forEach((constr) => {
          if (constr.param) {
            err[e.property].push([constr.key, constr.param]);
          } else {
            err[e.property].push([constr.key]);
          }
        });
    }
  });
  return err;
};

@Service()
@Middleware({ type: 'before' })
export class KoaControllerReturnHandler implements KoaMiddlewareInterface {
  private logger = Logger.getLogger(KoaControllerReturnHandler);
  use(ctx: Context, next: (err?: any) => Promise<any>): Promise<any> {
    return next()
      .then(() => {
        if (ctx.response.body === null) {
          throw new NotFoundError();
        }
      })
      .catch((error) => {
        if (typeof error === 'string') {
          ctx.response.status = 500;
          ctx.response.body = new BizError(error);
        } else if (error.isError && error.code) {
          ctx.response.status = error.code;
          ctx.response.body = error;
        } else if (error.name === 'BadRequestError' && error.errors && error.errors.length > 0) {
          ctx.response.status = 400;
          ctx.response.body = new BizError('error:validationError', transformer(error.errors));
        } else if (error.name === 'NotFoundError') {
          ctx.response.status = 404;
          ctx.response.body = error.message;
        } else {
          ctx.response.status = error.httpCode ?? 500;
          ctx.response.body = error.message;
          this.logger.error(error);
        }
      });
  }
}