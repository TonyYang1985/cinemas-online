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
    // 获取参数列表，包括属性名
    const param = ['property'];
    for (let i = 0; i < decorator.length - 1; i++) {
      param.push(`constraint${i + 1}`);
    }

    // 添加默认值参数
    //param.push('defaultValue');

    // 创建i18n消息函数
    const fn = i18nKey(`validation.rule.${decorator.name}`, param);

    // 准备装饰器参数
    const filledArgs = [...args];
    for (let i = 0; i < decorator.length - args.length - 1; i++) {
      filledArgs.push(undefined);
    }

    // 处理选项对象
    let options: any;
    if (decorator.length === filledArgs.length) {
      options = fn(filledArgs[filledArgs.length - 1]);
      filledArgs[filledArgs.length - 1] = options;
    } else if (decorator.length > filledArgs.length) {
      options = fn({});
      filledArgs.push(options);
    } else {
      throw '参数过多！';
    }
    // 尝试获取默认值
    try {
      // 对于原型属性（类实例属性）
      const defaultValue = (target as any)[propertyKey];
      if (defaultValue !== undefined) {
        // try {
        //   const msgObj = JSON.parse(options.message);
        //   msgObj.param.defaultValue = defaultValue;
        //   options.message = JSON.stringify(msgObj);
        // } catch (e) {
        //   console.error(`[i18n] 为 ${String(propertyKey)} 解析消息时出错:`, e);
        // }
      } else {
        // ES7类字段初始化器的替代方法
        // 这使用反射来查找字段初始化器
        const metadata = Reflect.getMetadata('design:type', target, propertyKey);
        // if (metadata) {
        //   // 创建临时实例以获取默认值
        //   const temp = new (target.constructor as any)();
        //   const value = temp[propertyKey];
        //   if (value !== undefined) {
        //     try {
        //       const msgObj = JSON.parse(options.message);
        //       msgObj.param.defaultValue = value;
        //       options.message = JSON.stringify(msgObj);
        //     } catch (e) {
        //       console.error(`[i18n] 为 ${String(propertyKey)} 解析消息时出错:`, e);
        //     }
        //   }
        // }
      }
      if (propertyKey === 'sort' || propertyKey === 'seatsPerRow') {
        console.log('decorator:', decorator.name);
        console.log('target:', target);
        console.log('propertyKey:', propertyKey);
        console.log('options:', options);
        console.log('filledArgs:', filledArgs);

        console.log(' decorator.length:', decorator.length);
        console.log(' filledArgs.length:', filledArgs.length);
        console.log('**********************');
      }
    } catch (e) {
      console.error(`[i18n] 获取 ${String(propertyKey)} 的默认值时出错:`, e);
    }

    // 应用原始装饰器
    try {
      return decorator(...filledArgs)(target, propertyKey);
    } catch (e) {
      console.error(`[i18n] 将装饰器 ${decorator.name} 应用到 ${String(propertyKey)} 时出错:`, e);
      throw e;
    }
  };
};
