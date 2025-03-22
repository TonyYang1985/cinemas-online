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

// TypeORM 0.3+ uses a different approach for DI integration

export type TypeormLoaderOption = {
  entities?: ClassType[];
  synchronize?: boolean;
};

export const typeormLoader = (option: TypeormLoaderOption) => (settings?: MicroframeworkSettings) => {
  const entities = option.entities || [];
  const cfg = ConfigManager.getConfig<DatabaseConfig>('database');
  const dbUrl = new URL(cfg.mariaDBUrl);

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
  (global as any).DataSourceManager = {
    default: dataSource,
  };
  
  // Register DataSource in TypeDI container
  Container.set(DataSource, dataSource);
  Container.set('typeorm.connection', dataSource);
  Container.set('typeorm.connection.default', dataSource);
  
  return dataSource
    .initialize()
    .then((conn) => {
      settings?.onShutdown(async () => await conn.destroy());
      const logger = Logger.getLogger('TypeormLoader');
      // 获取所有元数据实体
      const entityMetadatas = conn.entityMetadatas;
      // 为每个实体注册仓库
      entityMetadatas.forEach((metadata) => {
        const repository = conn.getRepository(metadata.target);
        const entityName = metadata.name;
        // 使用实体名称作为标识符注册仓库
        Container.set(`typeorm.repository.${entityName}`, repository);
        // 使用类作为标识符注册仓库（这对于使用 @InjectRepository() 装饰器很有用）
        if (typeof metadata.target === 'function') {
          Container.set(metadata.target, repository);
        } else {
          logger.warn(`Repository for entity "${entityName}" has a non-function target and cannot be registered with its target`);
        }
        logger.info(`Repository for entity "${entityName}" registered in container`);
        logger.info(`Repository for repository "${repository.metadata.targetName}" registered in container`);
      });
      logger.info(`🔗Database connected to ${dbUrl.hostname}:${dbUrl.port}${dbUrl.pathname}. CPU: ${cpus().length}`);
      return conn;
    })
    .catch((error) => {
      const logger = Logger.getLogger('TypeormLoader');
      logger.error('Database connection error', error);
      throw error;
    });
};
