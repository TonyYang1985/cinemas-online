/* eslint-disable @typescript-eslint/no-var-requires */
import { camelCase, startCase } from 'lodash';
import { URL } from 'url';
import tables from '../gen_db.json';
import { ConfigManager, DatabaseConfig } from '../src/fmk/libs';

const Entities = tables.map((n) => startCase(camelCase(n)).replace(/ /g, ''));
const cfg = ConfigManager.getConfig<DatabaseConfig>('database');
const db = new URL(cfg.mariaDBUrl);
const { hostname, pathname, port, username, password } = db;
const argv = process.argv;
const configs: string[] = [
  '-h', hostname,
  '-d', pathname.substr(1),
  '-p', port,
  '-u', username,
  '-x', password,
  '-e', 'mariadb',
  '-o', `${cfg.output || './src'}/repositories`,
  '--noConfig',
  '--cf', 'pascal',
  '--ce', 'pascal',
  '--cp', 'camel',
  '--relationIds',
  '--generateConstructor'
];

// '--active-record',
configs.map((c) => argv.push(c));

const path = require('path');
const _pathResolver = path.resolve;
path.resolve = (...args: any) => {
  let isTarget = false;
  args.map((arg: string) => {
    if (arg.indexOf('entity.mst') > -1) {
      isTarget = true;
    }
  });
  return isTarget ? _pathResolver(__dirname, 'repository.mst') : _pathResolver(...args);
};

const fs = require('fs');
const _writeFileSync = fs.writeFileSync;
let generatedAmount = 0;
let skippedAmount = 0;

fs.writeFileSync = (...args: any) => {
  const p = args[0] as string;
  args[0] = p.substr(0, p.length - 3) + 'Repo.ts';
  
  if (fs.existsSync(args[0])) {
    skippedAmount++;
  } else {
    const file = p.substring(p.lastIndexOf('/') + 1, p.lastIndexOf('.'));
    const skip = !Entities.includes(file);
    if (skip) {
      skippedAmount++;
    } else {
      // Modify the content to match the BaseRepository pattern
      const content = args[1].toString();
      if (content.includes('@InjectRepository')) {
        // Update the content to use the BaseRepository pattern
        const entityName = file;
        const updatedContent = content
          .replace(/import \{ Repository \} from 'typeorm';/, 'import { DataSource } from \'typeorm\';')
          .replace(/import \{ InjectRepository \} from 'typeorm-typedi-extensions';/, 'import { BaseRepository } from \'@footy/fmk\';')
          .replace(/@Service\(\)\nexport class (\w+)Repo \{/, '@Service()\nexport class $1Repo extends BaseRepository<$1> {')
          .replace(/constructor\(\n\s+@InjectRepository\(\w+\)\n\s+private repository: Repository<\w+>\n\s+\) \{\}/,
                   'constructor(dataSource: DataSource) {\n        super(dataSource, ' + entityName + ');\n    }\n\n    //Pass-through methods to repository\n    async find(options?: any) {\n        return this.repository.find(options);\n    }');
        
        args[1] = updatedContent;
      }
      
      _writeFileSync(...args);
      console.log(`Repo ${args[0]} generated.`);
      generatedAmount++;
    }
  }
};

require('typeorm-model-generator/dist/src');

process.on('exit', () => {
  console.log(`Generated Repos: ${generatedAmount}`);
  console.log(`Skipped Repos: ${skippedAmount}`);
});