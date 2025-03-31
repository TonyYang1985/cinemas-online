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
  return (target: object, propertyKey: string | symbol) => {
    // Get parameter list, including property name
    const param = ['property'];
    for (let i = 0; i < decorator.length - 1; i++) {
      param.push(`constraint${i + 1}`);
    }

    // Create i18n message function
    const fn = i18nKey(`validation.rule.${decorator.name}`, param);

    // Prepare decorator parameters
    const filledArgs = [...args];
    for (let i = 0; i < decorator.length - args.length - 1; i++) {
      filledArgs.push(undefined);
    }

    // Process options object
    let options: any;
    if (decorator.length === filledArgs.length) {
      options = fn(filledArgs[filledArgs.length - 1]);
      filledArgs[filledArgs.length - 1] = options;
    } else if (decorator.length > filledArgs.length) {
      options = fn({});
      filledArgs.push(options);
    } else {
      throw 'Too many parameters!';
    }

    // Apply original decorator
    try {
      return decorator(...filledArgs)(target, propertyKey);
    } catch (e) {
      console.error(`[i18n] Error applying decorator ${decorator.name} to ${String(propertyKey)}:`, e);
      throw e;
    }
  };
};
