import cors from '@koa/cors';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import http from 'http';
import jsonata from 'jsonata';
import { default as Koa } from 'koa';
import favicon from 'koa-favicon';
import json from 'koa-json';
import logger from 'koa-logger';
import _ from 'lodash';
import { MicroframeworkSettings } from 'microframework';
import 'reflect-metadata';
import { Action, getMetadataArgsStorage, RoutingControllersOptions, useContainer as useContainerRC, useKoaServer } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import SocketIO from 'socket.io';
import { Container } from 'typedi';
import { ClassType } from '@footy/fmk/libs/type';
import { jwtUtil } from '@footy/fmk/utils';
import { ApplicationConfig,ConfigManager } from '@footy/fmk/libs/configure';
import { HealthCheckController } from '@footy/fmk/libs/healthcheck';
import { KoaControllerReturnHandler } from './KoaControllerReturnHandler';
import { KoaLoaderOption } from './KoaLoaderOption';
import { KoaHolder } from './KoaLoaderOption';

export const koaLoader = (option: KoaLoaderOption) => (options?: MicroframeworkSettings) => {
  useContainerRC(Container);
  const cfg = ConfigManager.getConfig<ApplicationConfig>('application');
  const webapp = new Koa();
  KoaHolder.koa = webapp;
  webapp.use(cors());
  webapp.use(favicon('favicon.ico'));
  if (option.use) {
    option.use.forEach((mw) => webapp.use(mw));
  }
  if (ConfigManager.isDevelopment()) {
    webapp.use(logger());
  }
  if (ConfigManager.isDevelopment()) {
    webapp.use(json());
  }
  const svcPath = `/api/v${cfg.version}/${cfg.appName}`;
  const useKoaServerOption: RoutingControllersOptions = {
    routePrefix: svcPath,
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
  if (option.restfulControllers) {
    useKoaServerOption.controllers = option.restfulControllers;
  }

  if (_.isNil(useKoaServerOption.controllers)) {
    useKoaServerOption.controllers = [];
  }
  useKoaServerOption.controllers.push(HealthCheckController as any);

  if (option.authorizationChecker) {
    useKoaServerOption.authorizationChecker = option.authorizationChecker;
  }

  if (option.currentUserChecker) {
    useKoaServerOption.currentUserChecker = option.currentUserChecker;
  } else {
    useKoaServerOption.currentUserChecker = async (action: Action) => {
      const authorization = action.request.headers['authorization'];
      if (authorization) {
        return jwtUtil.decodeJwt(authorization);
      }
    };
  }
  useKoaServer(webapp, useKoaServerOption);
  const server = http.createServer(webapp.callback());

  if (option.wsControllers) {
    const io = new SocketIO.Server(server, { path: `${svcPath}/socket.io` });
    setupSocketControllers(io, option.wsControllers);
    Container.set('SocketIO', io);
  }
  options?.onShutdown(
    async () =>
      new Promise<void>((done) => {
        console.log('Shutting down the server ...');
        server.close(() => {
          done();
        });
      }),
  );
  const storage = getMetadataArgsStorage();
  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/',
  });
  schemas['Object'] = {
    type: 'string',
  };
  schemas['Array'] = {
    type: 'array',
  };
  const apiDoccfg = ConfigManager.getConfig<{ disabled: boolean }>('openapiCfg');
  if (!apiDoccfg.disabled) {
    const pkgVersion = ConfigManager.getPkgVersion();
    const spec = routingControllersToSpec(storage, useKoaServerOption, {
      info: {
        title: cfg.appName,
        description: `Open API 3 doc for module ${cfg.appName}`,
        version: `v${cfg.version} / ${pkgVersion}`,
      },
      servers: [
        {
          url: `http://localhost:${cfg.port}`,
          description: 'Local Development',
        },
        {
          url: `http://${cfg.appName}:${cfg.port}`,
          description: 'Dev Development (Must via Dev Proxy)',
        },
      ],
      components: { schemas },
    });
    const names = new Set();
    const expression = jsonata('$sort(*.*.*.tags)');
    expression.evaluate(spec)
      .then(result => {
        if (Array.isArray(result)) {
          result.forEach((tag: string) => names.add(tag));
        }

        const tags: Array<any> = [];
        Array.from(names).forEach((name) => {
          tags.push({
            name,
            description: `Generated from ${name} controller`,
          });
        });
        spec.tags = tags;
      })
      .catch(error => {
        console.error('Error processing API tags:', error);
        spec.tags = [];
      });

    webapp.use(async (ctx, next) => {
      if (ctx.request.url === `${useKoaServerOption.routePrefix}/api/openapi`) {
        ctx.response.type = 'application/json; charset=utf-8';
        ctx.body = JSON.stringify(spec, null, 2);
      } else {
        await next();
      }
    });
  }
  if (!option.noListening) {
    return new Promise((resolve) => {
      server.listen(cfg.port, () => {
        resolve(server);
      });
    });
  }
};


function setupSocketControllers(io: SocketIO.Server, controllers: ClassType[]) {
  console.log('Setting up Socket.IO controllers');

  for (const controllerClass of controllers) {
    try {
      let controller;
      try {
        controller = Container.get(controllerClass);
      } catch (e) {
        controller = new controllerClass();
        Container.set(controllerClass, controller);
      }
      let namespace = '/';
      if (typeof controller.getNamespace === 'function') {
        namespace = controller.getNamespace();
      } else if (controller.namespace) {
        namespace = controller.namespace;
      }
      const nsp = namespace === '/' ? io : io.of(namespace);
      console.log(`Setting up Socket controller ${controllerClass.name} on namespace: ${namespace}`);
      nsp.on('connection', (socket) => {
        console.log(`Socket connected to ${namespace}: ${socket.id}`);
        if (typeof controller.handleConnection === 'function') {
          controller.handleConnection(socket, nsp);
        }
        if (typeof controller.registerEvents === 'function') {
          controller.registerEvents(socket, nsp);
        }
        socket.on('disconnect', () => {
          if (typeof controller.handleDisconnection === 'function') {
            controller.handleDisconnection(socket);
          } else if (typeof controller.disconnect === 'function') {
            controller.disconnect(socket);
          }
        });
      });
      console.log(`Registered Socket controller: ${controllerClass.name}`);
    } catch (error) {
      console.error(`Error setting up Socket controller ${controllerClass.name}:`, error);
    }
  }
}