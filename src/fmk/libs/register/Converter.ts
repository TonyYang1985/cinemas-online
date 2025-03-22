import { ApplicationConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { HttpMethodsRegistry, MenuRegistry, UIRegistry } from '@footy/fmk/libs/register/ResRegTypes';

export type ApiData = Array<{
  app: string;
  functionName: string;
  uri: string;
  method: string;
  mod: string;
  version: string;
  apiName?: string;
}>;

export type UIData = Array<{
  app: string;
  functionName: string;
  uiName: string;
  mod: string;
  version: string;
}>;

export type MenuData = Array<{
  app: string;
  functionName: string;
  menuName: string;
  mod: string;
  version: string;
}>;

export const toApp = (app: string | string[]) => {
  if (Array.isArray(app)) {
    return app.map((a) => `(${a})`).join('|');
  } else {
    return app;
  }
};

export const pathReplacer = (path: string) => {
  const parts = path.split('/');
  const parts2 = parts.map((p) => {
    if (p.startsWith(':')) {
      return `{{${p.substring(1)}}}`;
    } else {
      return p;
    }
  });
  return parts2.join('/');
};

export class Converter {
  static api(reg: HttpMethodsRegistry) {
    const cfg = ConfigManager.getConfig<ApplicationConfig>('application');
    const apis: ApiData = [];
    Object.keys(reg).forEach((rootPath) => {
      Object.keys(reg[rootPath]).forEach((path) => {
        reg[rootPath][path].forEach((api) => {
          if (api['functionName'] !== 'internal') {
            apis.push({
              app: `${toApp(api['app'])}`,
              functionName: `${cfg.appName}.${api['functionName']}`,
              uri: `/${cfg.appName}${rootPath}${path}`,
              method: `${api['method']}`,
              mod: `${cfg.appName}`,
              version: `${cfg.version}`,
            });
          }
        });
      });
    });
    apis.unshift({
      app: '*',
      functionName: `${cfg.appName}.api.doc`,
      uri: `/${cfg.appName}/`,
      method: 'GET',
      mod: `${cfg.appName}`,
      version: `${cfg.version}`,
    });
    apis.unshift({
      app: '*',
      functionName: `${cfg.appName}.api.doc`,
      uri: `/${cfg.appName}/api/openapi`,
      method: 'GET',
      mod: `${cfg.appName}`,
      version: `${cfg.version}`,
    });
    apis.unshift({
      app: '*',
      functionName: `${cfg.appName}.api.doc`,
      uri: `/${cfg.appName}/api/web/CommonApiParam.yaml`,
      method: 'GET',
      mod: `${cfg.appName}`,
      version: `${cfg.version}`,
    });
    apis.unshift({
      app: '*',
      functionName: `${cfg.appName}.api.doc`,
      uri: `/${cfg.appName}/api/web/API.yaml`,
      method: 'GET',
      mod: `${cfg.appName}`,
      version: `${cfg.version}`,
    });
    apis.unshift({
      app: '*',
      functionName: `${cfg.appName}.api.doc`,
      uri: `/${cfg.appName}/api/web/API.json`,
      method: 'GET',
      mod: `${cfg.appName}`,
      version: `${cfg.version}`,
    });
    return apis;
  }

  static apiAll(reg: HttpMethodsRegistry) {
    const cfg = ConfigManager.getConfig<ApplicationConfig>('application');
    const apis: ApiData = [];
    Object.keys(reg).forEach((rootPath) => {
      Object.keys(reg[rootPath]).forEach((path) => {
        reg[rootPath][path].forEach((api) => {
          apis.push({
            app: `${toApp(api['app'])}`,
            functionName: `${cfg.appName}.${api['functionName']}`,
            uri: `/${cfg.appName}${rootPath}${path}`,
            method: `${api['method']}`,
            mod: `${cfg.appName}`,
            version: `${cfg.version}`,
            apiName: `${api['_apiName']}`,
          });
        });
      });
    });
    apis.unshift({
      app: '*',
      functionName: `${cfg.appName}.api.doc`,
      uri: `/${cfg.appName}/`,
      method: 'GET',
      mod: `${cfg.appName}`,
      version: `${cfg.version}`,
      apiName: `${cfg.appName}.api.doc`,
    });
    return apis;
  }

  static ui(reg: UIRegistry) {
    const cfg = ConfigManager.getConfig<ApplicationConfig>('application');
    const uis: UIData = [];
    Object.keys(reg).forEach((uiName) => {
      uis.push({
        app: `${reg[uiName]['app']}`,
        functionName: `${cfg.appName}.${reg[uiName]['functionName']}`,
        uiName: `${uiName}`,
        mod: `${cfg.appName}`,
        version: `${cfg.version}`,
      });
    });
    return uis;
  }

  static menu(reg: MenuRegistry) {
    const cfg = ConfigManager.getConfig<ApplicationConfig>('application');
    const uis: MenuData = [];
    Object.keys(reg).forEach((uiName) => {
      uis.push({
        app: `${reg[uiName]['app']}`,
        functionName: `${cfg.appName}.${reg[uiName]['functionName']}`,
        menuName: `${uiName}`,
        mod: `${cfg.appName}`,
        version: `${cfg.version}`,
      });
    });
    return uis;
  }
}
