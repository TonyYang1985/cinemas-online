import jsyaml from 'js-yaml';
import _ from 'lodash';
import * as rc from 'routing-controllers';
import { ApplicationConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { Logger } from '@footy/fmk/libs/logger';
import { Converter, pathReplacer } from '@footy/fmk/libs/register/Converter';
import { Get, httpMethodsRegistry, JsonController } from '@footy/fmk/libs/register/HttpMethods';


export const API_EXPORT_EXCLUSION = [];

const getBaseUrl = () => {
    const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
    return `/api/v${appCfg.version}`;
};
const getHost = () => {
    const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
    return `http://${appCfg.appName}:${appCfg.port}`;
};

@JsonController()
export class ApiRegisterController {
    private logger = Logger.getLogger(ApiRegisterController);

    @Get('/api/list')
    async showAllApisOfThisModule() {
        return Converter.api(httpMethodsRegistry);
    }

    @Get('/')
    @rc.ContentType('text/html')
    async index() {
        const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
        return `
        <html>
        <body>
        <h1>${appCfg.appName} API v${appCfg.version}/${ConfigManager.getPkgVersion()}/${ConfigManager.getBuildNumber()}</h1>
        <h2>
            <ol>
                <li><a href="/api/v${appCfg.version}/${appCfg.appName}/api/openapi">[JSON] OpenAPI spec</a></li>
                <hr>
                <li><a href="/api/v${appCfg.version}/${appCfg.appName}/api/web/CommonApiParam.yaml">[YAML] Frontend web CommonApiParam.yaml</a></li>
                <li><a href="/api/v${appCfg.version}/${appCfg.appName}/api/web/API.yaml">[YAML] Frontend web APIs: API.yaml</a></li>
                <li><a href="/api/v${appCfg.version}/${appCfg.appName}/api/web/API.json">[JSON] Frontend web APIs: API.json</a></li>
                <hr>
                <li><a href="/api/v${appCfg.version}/${appCfg.appName}/api/svc/CommonApiParam.yaml">[YAML] Backend micro service CommonApiParam.yaml</a></li>
                <li><a href="/api/v${appCfg.version}/${appCfg.appName}/api/svc/API.yaml">[YAML] Backend micro service APIs: API.yaml</a></li>
                <li><a href="/api/v${appCfg.version}/${appCfg.appName}/api/svc/API.json">[JSON] Backend micro service APIs: API.json</a></li>
            </ol>
        </h2>
        </body>
        </htmlL
        `;
    }

    @Get('/api/web/CommonApiParam.yaml')
    async restClientConfigWebCommonApiParamWeb() {
        const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
        const exclusion = API_EXPORT_EXCLUSION.map((ex) => _.trim(ex));
        exclusion.push(`${appCfg.appName}.api.doc`);
        // response.type = 'text/yaml; charset=utf-8';
        const baseUrl = getBaseUrl();
        const apis = {
            [`${appCfg.appName}BaseUrl`]: baseUrl,
        };
        return jsyaml.dump(apis);
    }

    @Get('/api/web/API.yaml')
    async restClientConfigWeb() {
        const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
        const exclusion = API_EXPORT_EXCLUSION.map((ex) => _.trim(ex));
        exclusion.push(`${appCfg.appName}.api.doc`);
        const apis = {};
        const baseUrl = getBaseUrl();
        Converter.apiAll(httpMethodsRegistry)
            .filter((api) => exclusion.indexOf(api.apiName!) === -1 && !api.apiName!.startsWith('internal'))
            .forEach((api) => {
                _.set(apis, api.apiName!, {
                    method: api.method,
                    endPoint: `{{${appCfg.appName}BaseUrl}}${pathReplacer(api.uri)}`,
                });
            });
        return jsyaml.dump(apis);
    }

    @Get('/api/web/API.json')
    async restClientWebApis() {
        const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
        const exclusion = API_EXPORT_EXCLUSION.map((ex) => _.trim(ex));
        exclusion.push(`${appCfg.appName}.api.doc`);
        // response.type = 'text/yaml; charset=utf-8';
        const apis = {};
        Converter.apiAll(httpMethodsRegistry)
            .filter((api) => exclusion.indexOf(api.apiName!) === -1 && !api.apiName!.startsWith('internal'))
            .forEach((api) => {
                _.set(apis, api.apiName!, api.apiName!);
            });
        return apis;
    }

    @Get('/api/svc/CommonApiParam.yaml')
    async restClientConfigWebCommonApiParamSvc() {
        const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
        const exclusion = API_EXPORT_EXCLUSION.map((ex) => _.trim(ex));
        exclusion.push(`${appCfg.appName}.api.doc`);
        // response.type = 'text/yaml; charset=utf-8';
        const baseUrl = getBaseUrl();
        const host = getHost();
        const apis = {
            [`${appCfg.appName}BaseUrl`]: `${host}${baseUrl}`,
        };
        return jsyaml.dump(apis);
    }

    @Get('/api/svc/API.yaml')
    async restClientConfigService() {
        const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
        const exclusion = API_EXPORT_EXCLUSION.map((ex) => _.trim(ex));
        exclusion.push(`${appCfg.appName}.api.doc`);
        // response.type = 'text/yaml; charset=utf-8';
        const apis = {};
        Converter.apiAll(httpMethodsRegistry)
            .filter((api) => exclusion.indexOf(api.apiName!) === -1)
            .forEach((api) => {
                _.set(apis, api.apiName!, {
                    method: api.method,
                    endPoint: `{{${appCfg.appName}BaseUrl}}${pathReplacer(api.uri)}`,
                });
            });
        return jsyaml.dump(apis);
    }

    @Get('/api/svc/API.json')
    async restClientSvcApi() {
        const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
        const exclusion = API_EXPORT_EXCLUSION.map((ex) => _.trim(ex));
        exclusion.push(`${appCfg.appName}.api.doc`);
        // response.type = 'application/json; charset=utf-8';
        const apis = {};
        Converter.apiAll(httpMethodsRegistry)
            .filter((api) => exclusion.indexOf(api.apiName!) === -1)
            .map((api) => {
                api.apiName! = api.apiName!.replace('_internal.', 'internal.');
                return api;
            })
            .forEach((api) => {
                _.set(apis, api.apiName!, api.apiName!);
            });
        return apis;
    }
}