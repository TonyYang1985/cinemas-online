import { MicroframeworkSettings } from 'microframework';
import { cpus } from 'os';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext, patchTypeORMRepositoryWithBaseRepository } from 'typeorm-transactional-cls-hooked';
import { URL } from 'url';
import { DatabaseConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { Logger } from '@footy/fmk/libs/logger';
import { ClassType } from '@footy/fmk/libs/type';
import Container from 'typedi';

initializeTransactionalContext();
patchTypeORMRepositoryWithBaseRepository();

export type TypeormLoaderOption = {
  entities?: ClassType[];
  synchronize?: boolean;
};

export const typeormLoader = (option: TypeormLoaderOption) => (settings?: MicroframeworkSettings) => {
  const entities = option.entities || [];
  const cfg = ConfigManager.getConfig<DatabaseConfig>('database');
  const dbUrl = new URL(cfg.mariaDBUrl);

  const dataSource = new DataSource({
    type: 'mariadb',
    url: cfg.mariaDBUrl,
    charset: 'utf8mb4',
    synchronize: option.synchronize ?? false,
    logging: ConfigManager.isDevelopment(),
    entities,
    extra: {
      waitForConnections: true,
      connectionLimit: cpus().length * 2 + 1,
    },
  });

  return dataSource
    .initialize()
    .then((dataSource) => {
      settings?.onShutdown(async () => await dataSource.destroy());
      const logger = Logger.getLogger('TypeormLoader');
      logger.info(`🔗Database connected to ${dbUrl.hostname}:${dbUrl.port}${dbUrl.pathname}. CPU: ${cpus().length}`);
      Container.set(DataSource, dataSource);
      return dataSource;
    })
    .catch((error) => {
      const logger = Logger.getLogger('TypeormLoader');
      logger.error('Database connection error', error);
      throw error;
    });
};
