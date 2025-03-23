/* eslint-disable @typescript-eslint/no-this-alias */
// Universal Builder interface
export interface Builder<T> {
  build(): T;
}

// Universal Builder base class
export abstract class AbstractBuilder<T> implements Builder<T> {
  protected instance: T;

  constructor(instance: T) {
    this.instance = instance;
  }

  build(): T {
    return this.instance;
  }

  // Generic property setting method
  with<K extends keyof T>(key: K, value: T[K]): this {
    this.instance[key] = value;
    return this;
  }
}

// Generic Builder implementation
export class GenericBuilder<T> extends AbstractBuilder<T> {
  constructor(instance: T) {
    super(instance);
  }
}

// Generic Response base class
export abstract class BaseResponse {
  errorCode: string;

  errorMessage: string;

  // Static method using generics to ensure correct type inference
  static createBuilder<R extends BaseResponse>(this: new () => R): AbstractBuilder<R> {
    const Constructor = this;
    return new GenericBuilder<R>(new Constructor());
  }

  static error<R extends BaseResponse>(this: new () => R, errorCode: string, errorMessage: string): R {
    const Constructor = this;
    const instance = new Constructor();
    instance.errorCode = errorCode;
    instance.errorMessage = errorMessage;
    return instance;
  }
}
