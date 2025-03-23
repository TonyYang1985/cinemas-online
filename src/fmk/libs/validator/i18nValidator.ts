const i18nKey = (key: string, params: string[] = []) => {
  const msgObj: any = { key, param: {} };
  params.forEach((p) => {
    msgObj.param[p] = `$${p}`;
  });
  return (obj: any) => {
    const message = JSON.stringify(msgObj);
    return Object.assign({}, obj ?? {}, {
      message,
    });
  };
};

type ValidationDecorator = (...args: any[]) => PropertyDecorator;

export const i18n = (decorator: ValidationDecorator, ...args: any[]): PropertyDecorator => {
  const param = ['property'];
  for (let i = 0; i < decorator.length - 1; i++) {
    param.push(`constraint${i + 1}`);
  }
  const fn = i18nKey(`validation.rule.${decorator.name}`, param);
  const filledArgs = [...args];
  for (let i = 0; i < decorator.length - args.length - 1; i++) {
    filledArgs.push(undefined);
  }

  if (decorator.length === filledArgs.length) {
    filledArgs[filledArgs.length - 1] = fn(filledArgs[filledArgs.length - 1]);
    return decorator(...filledArgs);
  } else if (decorator.length > filledArgs.length) {
    return decorator(...filledArgs, fn({}));
  } else {
    throw 'Too many args!';
  }
};
