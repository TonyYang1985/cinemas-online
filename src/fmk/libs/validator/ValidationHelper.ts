/* eslint-disable @typescript-eslint/no-explicit-any */
import { validate, ValidationError, ValidatorOptions } from 'class-validator';
import { BadRequestError } from 'routing-controllers';

export type ValidationParam = {
  result: boolean | Promise<boolean>;
  property: string;
  msgKey: string;
  param?: any;
};

export class ValidationHelper {
  static async mustBeArray(obj: any) {
    return ValidationHelper.check({
      result: Array.isArray(obj),
      property: '',
      msgKey: 'input.mustBeArray.',
    });
  }

  static async mustNotBeArray(obj: any) {
    return ValidationHelper.check({
      result: !Array.isArray(obj),
      property: '',
      msgKey: 'input.mustNotBeArray.',
    });
  }

  static async check(...params: ValidationParam[]) {
    const validateErrors = new Array<ValidationError>();
    await Promise.all(
      params.map(async (p) => {
        const checkResult = await Promise.resolve(p.result);
        if (!checkResult) {
          const err = new ValidationError();
          err.property = p.property;
          err.constraints = {
            validationError: JSON.stringify({
              key: p.msgKey,
              param: p.param,
            }),
          };
          validateErrors.push(err);
        }
      }),
    );
    if (validateErrors.length > 0) {
      const httpErr = new BadRequestError(`Invalid input, check 'errors' property for more info.`) as any;
      httpErr.errors = validateErrors;
      throw httpErr;
    } else {
      return true;
    }
  }

  static async validateOrReject(object: object, validatorOptions?: ValidatorOptions | undefined): Promise<void> {
    const errors = await validate(object, validatorOptions);
    if (errors.length > 0) {
      const httpErr = new BadRequestError(`Invalid input, check 'errors' property for more info.`) as any;
      httpErr.errors = errors;
      throw httpErr;
    }
  }
}