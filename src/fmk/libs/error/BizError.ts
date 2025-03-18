export type TMessage = [string, Record<string, any>?];

export class BizError extends Error {
  isError = true;
  data?: any;
  errorMessage: TMessage;
  code = 500;

  constructor(tMessage: TMessage | string, data = {}) {
    super(typeof tMessage === 'string' ? tMessage : tMessage[0]);
    this.data = data;
    this.errorMessage = typeof tMessage !== 'string' ? tMessage : [tMessage];
  }
}