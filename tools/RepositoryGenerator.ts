/**
 * 数据库仓储生成器 / Database Repository Generator
 *
 * 功能说明 / Description:
 * 从数据库表结构自动生成 Repository 类，用于数据访问层封装
 * Automatically generates Repository classes from database tables for data access layer
 *
 * 使用方法 / Usage:
 * 1. 在 gen_db.json 中配置需要生成的表名
 *    Configure table names in gen_db.json
 * 2. 运行命令: yarn gen:db-repo
 *    Run command: yarn gen:db-repo
 *
 * 注意事项 / Notes:
 * - 需要先生成实体类 (yarn gen:db-schema)
 *   Entity classes must be generated first (yarn gen:db-schema)
 * - 使用自定义模板 (repository.mst) 生成 Repository
 *   Uses custom template (repository.mst) to generate Repositories
 * - 已存在的 Repository 文件不会被覆盖
 *   Existing Repository files will not be overwritten
 * - 生成的 Repository 继承自 BaseRepository<Entity>
 *   Generated Repositories extend BaseRepository<Entity>
 */

import { camelCase, startCase } from 'lodash';
import { Container } from 'typedi';
import { DataSource } from 'typeorm';
import { URL } from 'url';
import tables from '../gen_db.json';
import { ConfigManager, DatabaseConfig } from '@gaias/basenode';

/**
 * 生成数据库仓储类 / Generate database repository classes
 */
async function generateRepositories() {
  console.log('=== Starting Repository Generation ===');
  console.log('=== 开始生成数据库仓储 ===');

  // 转换表名为实体类名 (PascalCase)
  // Convert table names to entity class names (PascalCase)
  const Entities = tables.map((n) => startCase(camelCase(n)).replace(/ /g, ''));
  console.log('Repositories to generate / 待生成仓储:', Entities);

  // 获取数据库配置 / Get database configuration
  const cfg = ConfigManager.getConfig<DatabaseConfig>('database');

  console.log('Loaded config / 已加载配置:', cfg);

  if (!cfg.mariaDBUrl) {
    throw new Error('mariaDBUrl is not defined in database config / 数据库配置中未定义 mariaDBUrl');
  }

  // 解析数据库连接 URL / Parse database connection URL
  const db = new URL(cfg.mariaDBUrl);
  const { hostname, pathname, port, username, password } = db;

  console.log('Database connection info / 数据库连接信息:', {
    hostname,
    database: pathname.substring(1),
    port,
    username,
  });

  // 初始化 TypeORM 数据源 (TypeORM 0.3+)
  // Initialize TypeORM DataSource (TypeORM 0.3+)
  const dataSource = new DataSource({
    type: 'mysql',
    host: hostname,
    port: parseInt(port),
    username: username,
    password: password,
    database: pathname.substring(1),
    synchronize: false, // 不自动同步，仅读取结构 / Don't auto-sync, only read structure
    logging: false, // 关闭日志输出 / Disable logging
  });

  try {
    // 连接数据库 / Connect to database
    await dataSource.initialize();
    console.log('✅ Database connected successfully / 数据库连接成功');

    // 注册数据源到依赖注入容器 / Register DataSource in TypeDI container
    Container.set('dataSource', dataSource);

    // 配置 typeorm-model-generator 参数
    // Configure typeorm-model-generator arguments
    const argv = process.argv;
    const configs: string[] = [
      '-h',
      hostname, // 数据库主机 / Database host
      '-d',
      pathname.substring(1), // 数据库名 / Database name
      '-p',
      port, // 端口 / Port
      '-u',
      username, // 用户名 / Username
      '-x',
      password, // 密码 / Password
      '-e',
      'mysql', // 数据库类型 / Database type
      '-o',
      `${cfg.output || './src'}/repositories`, // 输出目录 / Output directory
      '--noConfig', // 不使用配置文件 / Don't use config file
      '--cf',
      'pascal', // 类文件名格式: PascalCase / Class file naming: PascalCase
      '--ce',
      'pascal', // 类名格式: PascalCase / Class naming: PascalCase
      '--cp',
      'camel', // 属性名格式: camelCase / Property naming: camelCase
      '--relationIds', // 生成关系 ID / Generate relation IDs
      '--generateConstructor', // 生成构造函数 / Generate constructor
    ];

    configs.forEach((c) => argv.push(c));

    // Monkey-patch path.resolve 以使用自定义模板
    // Monkey-patch path.resolve to use custom template
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const _pathResolver = path.resolve;

    path.resolve = (...args: any) => {
      let isTarget = false;

      // 检查是否为实体模板路径 / Check if it's entity template path
      args.forEach((arg: string) => {
        if (arg.indexOf('entity.mst') > -1) {
          isTarget = true;
        }
      });

      // 替换为自定义仓储模板 / Replace with custom repository template
      return isTarget ? _pathResolver(__dirname, 'repository.mst') : _pathResolver(...args);
    };

    // Monkey-patch fs.writeFileSync 以自定义文件生成逻辑
    // Monkey-patch fs.writeFileSync to customize file generation logic
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    const _writeFileSync = fs.writeFileSync;
    let generatedAmount = 0;
    let skippedAmount = 0;

    fs.writeFileSync = (...args: any) => {
      const originalPath = args[0] as string;

      // 修改文件名: Entity.ts -> EntityRepo.ts
      // Change filename: Entity.ts -> EntityRepo.ts
      args[0] = originalPath.substring(0, originalPath.length - 3) + 'Repo.ts';

      // 检查文件是否已存在，避免覆盖手动修改的代码
      // Check if file already exists to avoid overwriting manual changes
      if (fs.existsSync(args[0])) {
        console.log(`⏭️  Skipped (exists) / 已跳过 (已存在): ${args[0]}`);
        skippedAmount++;
        return;
      }

      // 从路径中提取实体名 / Extract entity name from path
      const file = originalPath.substring(originalPath.lastIndexOf('/') + 1, originalPath.lastIndexOf('.'));

      // 检查是否在白名单中 / Check if in whitelist
      const skip = !Entities.includes(file);

      if (skip) {
        console.log(`⏭️  Skipped (not in list) / 已跳过 (不在列表中): ${file}`);
        skippedAmount++;
      } else {
        _writeFileSync(...args);
        console.log(`✅ Generated / 已生成: ${args[0]}`);
        generatedAmount++;
      }
    };

    // 运行 typeorm-model-generator
    // Run typeorm-model-generator
    console.log('\n🚀 Running typeorm-model-generator... / 正在运行生成器...\n');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('typeorm-model-generator/dist/src');

    // 等待 typeorm-model-generator 完成
    // typeorm-model-generator 是同步执行的，使用 setTimeout 确保完成后清理资源
    // Wait for typeorm-model-generator to complete
    // It runs synchronously, use setTimeout to ensure cleanup after completion
    setTimeout(async () => {
      console.log('\n=== Generation Summary / 生成摘要 ===');
      console.log(`✅ Generated Repositories / 已生成仓储: ${generatedAmount}`);
      console.log(`⏭️  Skipped Repositories / 已跳过仓储: ${skippedAmount}`);

      // 关闭数据库连接 / Close database connection
      if (dataSource.isInitialized) {
        await dataSource.destroy();
        console.log('✅ Database connection closed / 数据库连接已关闭\n');
      }

      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('❌ Error during repository generation / 生成仓储时出错:', error);

    // 确保错误时也关闭连接 / Ensure connection is closed on error
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    process.exit(1);
  }
}

// 运行生成器 / Run the generator
generateRepositories().catch((error) => {
  console.error('Fatal error / 致命错误:', error);
  process.exit(1);
});
