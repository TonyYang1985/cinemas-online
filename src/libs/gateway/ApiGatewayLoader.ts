import _ from 'lodash';
import { MicroframeworkSettings } from 'microframework';
import { upstreamUriTemplate, upstreamTemplate, serviceUriTemplate, serviceTemplate, routeUriTemplate, routeTemplate, httpPut } from '@footy/fmk/libs/apisix';
import { ApplicationConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { Logger } from '@footy/fmk/libs/logger';

export type ApiGatewayLoaderOption = unknown;
const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const apiGatewayLoader = (option: ApiGatewayLoaderOption) => async (settings?: MicroframeworkSettings) => {
    const enableApiGateway = process.env['ENABLE_API_GATEWAY'];
    const enableApiGatewayAuth = 'true' === process.env['ENABLE_API_GATEWAY_AUTH'];
    if (!ConfigManager.isDevelopment() && _.isEqual((enableApiGateway ?? '').toLowerCase().trim(), 'true')) {
        const apiGatewayHostPort = process.env['API_GATEWAY_HOST_PORT'] ?? '';
        const [host, _port] = apiGatewayHostPort.split(':');
        const port = parseInt(_port);
        const appCfg = ConfigManager.getConfig<ApplicationConfig>('application');
        const appName = appCfg.appName;
        const appVersion = appCfg.version;
        const appBuild = appCfg.build;
        const appPort = appCfg.port;
        const domains = appCfg.domains;
        const logger = Logger.getLogger('ApiGatewayLoader');
        try {
            logger.info(`🔗ApiGateway: try to register ${appName} to apisix`);
            await httpPut(`http://${apiGatewayHostPort}${upstreamUriTemplate(appName)}`, upstreamTemplate(appName, appVersion, appPort));
            await sleep(1000);
            await httpPut(`http://${apiGatewayHostPort}${serviceUriTemplate(appName)}`, serviceTemplate(appName, enableApiGatewayAuth));
            await sleep(1000);
            await httpPut(`http://${apiGatewayHostPort}${routeUriTemplate(appName)}`, routeTemplate(appName, domains, appVersion, appBuild, appVersion));
            logger.info(`🔗ApiGateway: register ${appName} to apisix successfully`);
        } catch (err) {
            logger.error(`🔗ApiGateway: register ${appName} to apisix failed, ${err}`);
        }
    }
};
