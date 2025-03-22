import 'reflect-metadata';
import { MicroframeworkSettings } from 'microframework';
import { cpus } from 'os';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext, patchTypeORMRepositoryWithBaseRepository } from 'typeorm-transactional-cls-hooked';
import { URL } from 'url';
import { DatabaseConfig, ConfigManager } from '@footy/fmk/libs/configure';
import { Logger } from '@footy/fmk/libs/logger';
import { ClassType } from '@footy/fmk/libs/type';
import { Container } from 'typedi';

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
  // dataSource
  const dataSource = new DataSource({
    name: 'default',
    type: 'mariadb',
    url: cfg.mariaDBUrl,
    charset: 'utf8mb4',
    entities,
    synchronize: option.synchronize ?? false,
    logging: ConfigManager.isDevelopment(),
    extra: {
      waitForConnections: true,
      connectionLimit: cpus().length * 2 + 1,
      queueLimit: 0,
    },
  });

  return dataSource
    .initialize()
    .then((conn) => {
      settings?.onShutdown(async () => await conn.destroy());
      const logger = Logger.getLogger('TypeormLoader');
      // entity Metadatas
      const entityMetadatas = conn.entityMetadatas;
      // Register Repository by entity name and class
      entityMetadatas.forEach((metadata) => {
        const repository = conn.getRepository(metadata.target);
        const entityName = metadata.name;
        // Register Repository by entity name
        Container.set(`typeorm.repository.${entityName}`, repository);
        // Register Repository by class
        if (typeof metadata.target === 'function') {
          Container.set(metadata.target, repository);
        }
        logger.info(`Repository for entity "${entityName}" registered in container`);
      });
      // Register DataSource in TypeDI container
      Container.set(DataSource, dataSource);
      logger.info(`🔗Database connected to ${dbUrl.hostname}:${dbUrl.port}${dbUrl.pathname}. CPU: ${cpus().length}`);
      return conn;
    })
    .catch((error) => {
      const logger = Logger.getLogger('TypeormLoader');
      logger.error('Database connection error', error);
      throw error;
    });
};
