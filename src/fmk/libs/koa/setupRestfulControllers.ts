import { Action, useKoaServer, RoutingControllersOptions } from 'routing-controllers';
import Koa from 'koa';
import { Container } from 'typedi';
import { ClassType } from '@footy/fmk/libs/type';
import { KoaControllerReturnHandler } from './KoaControllerReturnHandler';
import { jwtUtil } from '@footy/fmk/utils';
import { ConfigManager } from '@footy/fmk/libs/configure';
import _ from 'lodash';

/**
 * Setup Restful Controllers
 * @param app  Koa application instance
 * @param controllers  Controller type array
 * @param routePrefix   API route prefix
 * @param authorizationChecker   Authorization check function
 * @param currentUserChecker   Current user check function
 * @returns  Configured Koa application
 */
export function setupRestfulControllers(app: Koa, controllers: ClassType[], routePrefix: string, authorizationChecker?: (action: Action, roles: string[]) => Promise<boolean> | boolean, currentUserChecker?: (action: Action) => Promise<any> | any): Koa {
  //  Prepare configuration options
  const useKoaServerOption: RoutingControllersOptions = {
    routePrefix,
    classTransformer: true,
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
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: {
        target: false,
        value: false,
      },
    },
    development: ConfigManager.isDevelopment(),
    defaultErrorHandler: false,
    middlewares: [KoaControllerReturnHandler],
  };

  // Set controllers
  const allControllers = [...controllers];
  useKoaServerOption.controllers = allControllers;
  // Set authorization check
  if (authorizationChecker) {
    useKoaServerOption.authorizationChecker = authorizationChecker;
  }
  // Set current user check
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

  // Register controllers
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

  // Use Koa server
  useKoaServer(app, useKoaServerOption);
  return app;
}
