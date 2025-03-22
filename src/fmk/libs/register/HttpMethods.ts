import * as rc from 'routing-controllers';
import {  Service } from 'typedi';
import { ApplicationConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { HttpMethodsRegistry } from './ResRegTypes';

const DEFAULT_KEY = '____';
export const httpMethodsRegistry: HttpMethodsRegistry = {};
const tempRegistry: HttpMethodsRegistry = {
    [DEFAULT_KEY]: {},
};

const HttpMethod = (mName: string, method: (route: any) => any, route: string, app?: string | string[], functionName?: string) => {
    const decorator: MethodDecorator = (target, propertyKey, descriptor) => {
        const { appName } = ConfigManager.getConfig<ApplicationConfig>('application');
        app = app ?? '*';
        const apiName = `${functionName ? '' : 'internal.'}${appName}.${target.constructor.name.replace('Controller', '')}.${propertyKey.toString()}`;
        if (!tempRegistry[DEFAULT_KEY][route]) {
            tempRegistry[DEFAULT_KEY][route] = [];
        }
        tempRegistry[DEFAULT_KEY][route].push({ app, functionName: functionName ?? 'internal', method: mName, _apiName: apiName });
        method(route)(target, propertyKey, descriptor);
    };
    return decorator;
};

export const Get = (route: string, app?: string | string[], functionName?: string) => {
    return HttpMethod('GET', rc.Get, route, app, functionName);
};

export const Post = (route: string, app?: string | string[], functionName?: string) => {
    return HttpMethod('POST', rc.Post, route, app, functionName);
};

export const Put = (route: string, app?: string | string[], functionName?: string) => {
    return HttpMethod('PUT', rc.Put, route, app, functionName);
};

export const Delete = (route: string, app?: string | string[], functionName?: string) => {
    return HttpMethod('DELETE', rc.Delete, route, app, functionName);
};

export const All = (route: string, app?: string | string[], functionName?: string) => {
    return HttpMethod('ALL', rc.All, route, app, functionName);
};

export const JsonController = (baseRoute?: string) => {
    const decorator: ClassDecorator = (target) => {
        if (Object.keys(tempRegistry[DEFAULT_KEY]).length > 0) {
            httpMethodsRegistry[baseRoute ?? ''] = Object.assign({}, httpMethodsRegistry[baseRoute ?? ''], tempRegistry[DEFAULT_KEY]);
        }
        tempRegistry[DEFAULT_KEY] = {};
        rc.JsonController(baseRoute)(target);
        Service()(target);
    };

    return decorator;
};