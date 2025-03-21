import fs from 'fs';
import glob from 'glob-promise';
import yaml from 'js-yaml';

const mergeJSON = require('merge-json');  
const configFiles: string[] = [];

const find = (path: string): string | undefined => configFiles.find((f) => f === `${path}.yml`);

export interface Config extends Record<string, unknown> {
  [key: string]: unknown;
}

export const loadConfig = (name: string): Config => {
  if (configFiles.length === 0) {
    glob.sync('./cfg/*.yml').forEach((f: string) => configFiles.push(f));
  }
  const environment = process.env.NODE_ENV;
  const zone = process.env.DEV_ZONE;
  const envConfigFile = `./cfg/${name}.${environment}`;
  const zoneConfigFile = `./cfg/${name}.${zone}`;
  const configFile = `./cfg/${name}`;
  let cfg: Config = {};

  const envFile = find(envConfigFile);
  if (envFile) {
    const envConfig = yaml.load(fs.readFileSync(envFile, 'utf8')) as Config;
    Object.assign(cfg, envConfig);
  }

  const zoneFile = find(zoneConfigFile);
  if (zoneFile) {
    const zoneConfig = yaml.load(fs.readFileSync(zoneFile, 'utf8')) as Config;
    Object.assign(cfg, zoneConfig);
  }

  const file = find(configFile);
  if (file) {
    const config = yaml.load(fs.readFileSync(file, 'utf8')) as Config;
    cfg = mergeJSON.merge(cfg, config);
  }

  return cfg;
};
