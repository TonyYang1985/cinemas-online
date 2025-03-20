import { Action, useKoaServer, RoutingControllersOptions } from 'routing-controllers';
import Koa from 'koa';
import { Container } from 'typedi';
import { ClassType } from '@footy/fmk/libs/type';
import { KoaControllerReturnHandler } from './KoaControllerReturnHandler';
import { jwtUtil } from '@footy/fmk/utils';
import { ConfigManager } from '@footy/fmk/libs/configure';
import _ from 'lodash';

/**
 * 设置 Restful Controllers
 * @param app Koa应用实例
 * @param controllers 控制器类型数组
 * @param routePrefix API路由前缀
 * @param authorizationChecker 授权检查函数
 * @param currentUserChecker 当前用户检查函数
 * @returns 配置好的Koa应用
 */
export function setupRestfulControllers(app: Koa, controllers: ClassType[], routePrefix: string, authorizationChecker?: (action: Action, roles: string[]) => Promise<boolean> | boolean, currentUserChecker?: (action: Action) => Promise<any> | any): Koa {
  // 准备配置选项
  const useKoaServerOption: RoutingControllersOptions = {
    routePrefix,
    classTransformer: false,
    defaults: {
      nullResultCode: 404,
      undefinedResultCode: 204,
    },
    plainToClassTransformOptions: {
      excludeExtraneousValues: true,
    },
    classToPlainTransformOptions: {
      excludeExtraneousValues: false,
    },
    validation: {
      validationError: {
        target: false,
        value: false,
      },
    },
    development: ConfigManager.isDevelopment(),
    defaultErrorHandler: false,
    middlewares: [KoaControllerReturnHandler],
  };

  // 设置控制器
  const allControllers = [...controllers];
  useKoaServerOption.controllers = allControllers;
  // 设置授权检查
  if (authorizationChecker) {
    useKoaServerOption.authorizationChecker = authorizationChecker;
  }
  // 设置当前用户检查
  if (currentUserChecker) {
    useKoaServerOption.currentUserChecker = currentUserChecker;
  } else {
    useKoaServerOption.currentUserChecker = async (action: Action) => {
      const authorization = action.request.headers['authorization'];
      if (authorization) {
        return jwtUtil.decodeJwt(authorization);
      }
    };
  }

  // 注册控制器
  for (const controllerClass of controllers) {
    try {
      let controller;
      try {
        controller = Container.get(controllerClass);
      } catch (e) {
        controller = new controllerClass();
        Container.set(controllerClass, controller);
      }
      console.log(`Restful controller: ${controllerClass.name} Registered Done 🚀`);
    } catch (error) {
      console.error(`Error setting up Restful controller ${controllerClass.name}:`, error);
    }
  }

  // 使用 Koa 服务器
  useKoaServer(app, useKoaServerOption);
  return app;
}
