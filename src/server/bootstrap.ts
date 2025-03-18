import { internalIpV4 } from 'internal-ip';
import { bootstrapMicroframework, Microframework, MicroframeworkSettings } from 'microframework';
import 'reflect-metadata';
import { apiGatewayLoader } from '@footy/fmk/libs/gateway';
import { ApplicationConfig ,ConfigManager } from '@footy/fmk/libs/configure';
import { distributedEventsLoader } from '@footy/fmk/libs/event';
import { koaLoader } from '@footy/fmk/libs/koa';
import { Logger } from '@footy/fmk/libs/logger';
import { redisLoader } from '@footy/fmk/libs/redis';
import { typeormLoader } from '@footy/fmk/libs/orm';
import { BootstrapOption } from './BootstrapOption';

const emptyLoader = () => {};
const settingHolder: { setting?: MicroframeworkSettings;} = {};

export const bootstrap = async (option: BootstrapOption): Promise<Microframework> => {
    const logger = Logger.getLogger('Bootstrap');
    const loaders = [
      option.disableDatabase ? emptyLoader : typeormLoader(option),
      option.disableRedis ? emptyLoader : redisLoader(option),
      option.disableEvent ? emptyLoader : distributedEventsLoader(option),
      koaLoader(option),
      apiGatewayLoader(option),
      (settings?: MicroframeworkSettings) => {
        settingHolder.setting = settings;
      },
    ];
    if (option.loaders) {
      loaders.push(...option.loaders);
    }
    return bootstrapMicroframework({
      config: {
        showBootstrapTime: ConfigManager.isDevelopment(),
      },
      loaders,
    }).then(async (mfmk) => {
      (mfmk as any).frameworkSettings = settingHolder.setting;
      const cfg = ConfigManager.getConfig<ApplicationConfig>('application');
      const applicationName = cfg.appName;
      const host = ConfigManager.isProduction() ? applicationName : await internalIpV4();
      ConfigManager.basePath = `http://${host}:${cfg.port}/api/v${cfg.version}/${applicationName}/`;
      logger.info(`🚀Server(${applicationName}/v${cfg.version}/${ConfigManager.getPkgVersion()}/${ConfigManager.getBuildNumber()}) is listening on ${ConfigManager.basePath}`);
      if (option.wsControllers) {
        const wsPath = `http://${host}:${cfg.port}/api/v${cfg.version}/${applicationName}/socket.io`;
        logger.info(`🚀Server(${applicationName}/v${cfg.version}/${ConfigManager.getPkgVersion()}/${ConfigManager.getBuildNumber()}) is listening on ${wsPath}`);
      }
      return mfmk;
    });
  };