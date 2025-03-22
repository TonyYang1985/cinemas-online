/* eslint-disable @typescript-eslint/no-var-requires */
import { camelCase, startCase } from 'lodash';
import { URL } from 'url';
import { ConfigManager, DatabaseConfig } from '../src/fmk/libs';
import tables from '../gen_db.json';

const Entities = tables.map((n) => startCase(camelCase(n)).replace(/ /g, ''));
const cfg = ConfigManager.getConfig<DatabaseConfig>('database');
const db = new URL(cfg.mariaDBUrl);
const argv = process.argv;
const { hostname, pathname, port, username, password } = db;
const configs: string[] = [
  '-h', hostname, 
  '-d', pathname.substr(1), 
  '-p', port, 
  '-u', username, 
  '-x', password, 
  '-e', 'mariadb', 
  '-o', `${cfg.output || './src'}/entities`, 
  '--noConfig', 
  '--cf', 'pascal', 
  '--ce', 'pascal', 
  '--cp', 'camel', 
  '--relationIds', 
  '--generateConstructor'
];
configs.map((c) => argv.push(c));
const fs = require('fs');
const _writeFileSync = fs.writeFileSync;
let generatedAmount = 0;
let skippedAmount = 0;
fs.writeFileSync = (...args: any) => {
  const p = args[0] as string;
  const file = p.substring(p.lastIndexOf('/') + 1, p.lastIndexOf('.'));
  const skip = !Entities.includes(file);
  if (skip) {
    skippedAmount++;
  } else {
    _writeFileSync(...args);
    console.log(`Entities ${args[0]} generated.`);
    generatedAmount++;
  }
};

require('typeorm-model-generator/dist/src');
process.on('exit', () => {
  console.log(`Generated Entities: ${generatedAmount}`);
  console.log(`Skipped Entities: ${skippedAmount}`);
});
