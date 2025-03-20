import { MicroframeworkSettings } from 'microframework';
import { Container } from 'typedi';
import { DatabaseConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { Logger } from '@footy/fmk/libs/logger';
import { RedisClient } from './RedisClient';

export type RedisLoaderOption = unknown;

export const redisLoader = (option: RedisLoaderOption) => (settings?: MicroframeworkSettings) => {
  const cfg = ConfigManager.getConfig<DatabaseConfig>('redis');
  const redisClient: RedisClient = new RedisClient(cfg.redis);
  Container.set(RedisClient, redisClient);
  const { redis } = redisClient;
  settings?.onShutdown(async () => redis.disconnect());
  Logger.getLogger('RedisLoader').info(`🔗Redis connected.`);

  return new Promise<void>((resolve) => {
    redis.once('connect', () => {
      resolve();
    });
  });
};
