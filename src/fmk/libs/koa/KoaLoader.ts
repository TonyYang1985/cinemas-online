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
import { Action, getMetadataArgsStorage, RoutingControllersOptions, useContainer as useContainerRC } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import SocketIO from 'socket.io';
import { Container } from 'typedi';
import { jwtUtil } from '@footy/fmk/utils';
import { ApplicationConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { HealthCheckController } from '@footy/fmk/libs/healthcheck';
import { KoaControllerReturnHandler } from './KoaControllerReturnHandler';
import { KoaLoaderOption } from './KoaLoaderOption';
import { KoaHolder } from './KoaLoaderOption';
import { ClassType } from '@footy/fmk/libs/type';
import { setupRestfulControllers } from './setupRestfulControllers';
import { setupSocketControllers } from './setupSocketControllers';

export const koaLoader = (option: KoaLoaderOption) => (options?: MicroframeworkSettings) => {
  // 设置依赖注入容器
  useContainerRC(Container);
  // 获取应用配置
  const cfg = ConfigManager.getConfig<ApplicationConfig>('application');
  // 创建Koa应用
  const webapp = new Koa();
  KoaHolder.koa = webapp;
  // 添加中间件
  webapp.use(cors());
  webapp.use(favicon('favicon.ico'));
  if (option.use) {
    option.use.forEach((mw) => webapp.use(mw));
  }

  if (ConfigManager.isDevelopment()) {
    webapp.use(logger());
    webapp.use(json());
  }

  // 设置API路径
  const svcPath = `/api/v${cfg.version}/${cfg.appName}`;

  // 设置REST控制器
  if (option.restfulControllers) {
    console.log('\n✅ Setting up Restful controllers Start 🚀');
    setupRestfulControllers(webapp, option.restfulControllers, svcPath, option.authorizationChecker, option.currentUserChecker);
    console.log('✅ Setting up Restful controllers Done 🚀\n');
  }
  // 创建HTTP服务器
  const server = http.createServer(webapp.callback());
  // 设置WebSocket控制器
  if (option.wsControllers) {
    console.log('✅ Setting up Socket.IO controllers Start 🚀');
    const io = new SocketIO.Server(server, { path: `${svcPath}/socket.io` });
    setupSocketControllers(io, option.wsControllers);
    Container.set('SocketIO', io);
    console.log('✅ Setting up Socket.IO controllers Done 🚀\n');
  }

  // 设置关闭钩子
  options?.onShutdown(
    async () =>
      new Promise<void>((done) => {
        console.log('Shutting down the server ...');
        server.close(() => {
          done();
        });
      }),
  );

  // 生成OpenAPI文档
  const setupOpenAPI = () => {
    const storage = getMetadataArgsStorage();
    const schemas = validationMetadatasToSchemas({
      refPointerPrefix: '#/components/schemas/',
    });
    schemas['Object'] = { type: 'string' };
    schemas['Array'] = { type: 'array' };

    const apiDoccfg = ConfigManager.getConfig<{ disabled: boolean }>('openapiCfg');
    if (!apiDoccfg.disabled) {
      const pkgVersion = ConfigManager.getPkgVersion();

      // 构建Routing选项用于文档生成
      const routingOptions: RoutingControllersOptions = {
        routePrefix: svcPath,
        controllers: option.restfulControllers || [],
      };

      if (!Array.isArray(routingOptions.controllers)) {
        routingOptions.controllers = [];
      }

      routingOptions.controllers.push(HealthCheckController as any);

      const spec = routingControllersToSpec(storage, routingOptions, {
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
      expression
        .evaluate(spec)
        .then((result) => {
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
        .catch((error) => {
          console.error('Error processing API tags:', error);
          spec.tags = [];
        });

      webapp.use(async (ctx, next) => {
        if (ctx.request.url === `${svcPath}/api/openapi`) {
          ctx.response.type = 'application/json; charset=utf-8';
          ctx.body = JSON.stringify(spec, null, 2);
        } else {
          await next();
        }
      });
    }
  };

  // 设置OpenAPI文档
  setupOpenAPI();

  // 启动服务器（如果需要）
  if (!option.noListening) {
    return new Promise((resolve) => {
      server.listen(cfg.port, () => {
        resolve(server);
      });
    });
  }
};
