// @ts-ignore
import pino from 'pino';
import { ConfigManager } from '@footy/fmk/libs/configure';

export interface LoggerConfig {
  level: pino.Level;
  transport?: {
    target: string;
    options?: Record<string, any>;
  };
  prettyPrint?: any;
}

export class Logger {
  static getLogger<T>(owner: (new (...args: any[]) => T) | string): pino.Logger {
    let tag = 'Logger';
    if (typeof owner === 'string') {
      tag = owner;
    } else {
      tag = owner.name;
    }
    const loggerCfg = ConfigManager.getConfig<LoggerConfig>('logger');
    const transformedConfig = Logger.transformConfig(loggerCfg);
    const options: Record<string, any> = {
      name: tag,
      level: transformedConfig.level,
    };
    if (transformedConfig.transport) {
      options.transport = transformedConfig.transport;
    }
    const logger = pino(options);
    return logger;
  }

  private static transformConfig(config: LoggerConfig): LoggerConfig {
    const newConfig = { ...config };
    if (newConfig.transport) {
      return newConfig;
    }
    if (newConfig.prettyPrint) {
      newConfig.transport = {
        target: 'pino-pretty',
        options: {}
      };
      if (typeof newConfig.prettyPrint === 'object') {
        newConfig.transport.options = {
          ...newConfig.prettyPrint,
          colorize: newConfig.prettyPrint.colorize !== false
        };
      } else {
        newConfig.transport.options = {
          colorize: true,
          translateTime: 'SYS:standard'
        };
      }
      delete newConfig.prettyPrint;
    }
    return newConfig;
  }
}