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

const configs: string[] = ['-h', hostname, '-d', pathname.substr(1), '-p', port, '-u', username, '-x', password, '-e', 'mariadb', '-o', `${cfg.output || './src'}/repositories`, '--noConfig', '--cf', 'pascal', '--ce', 'pascal', '--cp', 'camel', '--relationIds', '--generateConstructor'];
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