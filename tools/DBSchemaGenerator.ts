/**
 * 数据库实体生成器 / Database Entity Generator
 *
 * 功能说明 / Description:
 * 从数据库表结构自动生成 TypeORM 实体类
 * Automatically generates TypeORM entity classes from database table structures
 *
 * 使用方法 / Usage:
 * 1. 在 gen_db.json 中配置需要生成的表名
 *    Configure table names in gen_db.json
 * 2. 运行命令: yarn gen:db-schema
 *    Run command: yarn gen:db-schema
 *
 * 注意事项 / Notes:
 * - 需要确保数据库连接配置正确 (cfg/database.yml)
 *   Ensure database connection is properly configured
 * - 生成的文件将输出到配置的 entities 目录
 *   Generated files will be output to the configured entities directory
 */

import { camelCase, startCase } from 'lodash';
import { Container } from 'typedi';
import { DataSource } from 'typeorm';
import { URL } from 'url';
import tables from '../gen_db.json';
import { ConfigManager, DatabaseConfig } from '@gaias/basenode';

/**
 * 生成数据库实体类 / Generate database entity classes
 */
async function generateSchema() {
  console.log('=== Starting Database Schema Generation ===');
  console.log('=== 开始生成数据库实体 ===');

  // 转换表名为实体类名 (PascalCase)
  // Convert table names to entity class names (PascalCase)
  const Entities = tables.map((n) => startCase(camelCase(n)).replace(/ /g, ''));
  console.log('Entities to generate / 待生成实体:', Entities);

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
      `${cfg.output || './src'}/entities`, // 输出目录 / Output directory
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

    // Monkey-patch fs.writeFileSync 以过滤需要生成的实体
    // Monkey-patch fs.writeFileSync to filter entities to generate
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    const _writeFileSync = fs.writeFileSync;
    let generatedAmount = 0;
    let skippedAmount = 0;

    fs.writeFileSync = (...args: any) => {
      const p = args[0] as string;
      // 从文件路径提取文件名 / Extract filename from path
      const file = p.substring(p.lastIndexOf('/') + 1, p.lastIndexOf('.'));
      // 检查是否在白名单中 / Check if in whitelist
      const skip = !Entities.includes(file);

      if (skip) {
        skippedAmount++;
        console.log(`⏭️  Skipped / 已跳过: ${file}`);
      } else {
        _writeFileSync(...args);
        console.log(`✅ Generated / 已生成: ${file}`);
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
      console.log(`✅ Generated Entities / 已生成实体: ${generatedAmount}`);
      console.log(`⏭️  Skipped Entities / 已跳过实体: ${skippedAmount}`);

      // 关闭数据库连接 / Close database connection
      if (dataSource.isInitialized) {
        await dataSource.destroy();
        console.log('✅ Database connection closed / 数据库连接已关闭\n');
      }

      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('❌ Error during schema generation / 生成实体时出错:', error);

    // 确保错误时也关闭连接 / Ensure connection is closed on error
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    process.exit(1);
  }
}

// 运行生成器 / Run the generator
generateSchema().catch((error) => {
  console.error('Fatal error / 致命错误:', error);
  process.exit(1);
});
