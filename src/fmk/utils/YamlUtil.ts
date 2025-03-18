import fs from 'fs';
import glob from 'glob-promise';
import yaml from 'js-yaml';


const mergeJSON = require('merge-json');
const configFiles: string[] = [];

const find = (path: string) => {
    return configFiles.find((f) => f === `${path}.yml`);
};

export const loadConfig = (name: string): any => {
    if (configFiles.length === 0) {
        glob.sync('./cfg/*.yml').forEach((f: string) => configFiles.push(f));
    }
    const environment = process.env.NODE_ENV;
    const zone = process.env.DEV_ZONE;
    const envConfigFile = `./cfg/${name}.${environment}`;
    const zoneConfigFile = `./cfg/${name}.${zone}`;
    const configFile = `./cfg/${name}`;
    let cfg = {};
    const envFile = find(envConfigFile);
    if (envFile) {
        const envConfig = yaml.load(fs.readFileSync(envFile, 'utf8'));
        Object.assign(cfg, envConfig);
    }
    const zoneFile = find(zoneConfigFile);
    if (zoneFile) {
        const zoneConfig = yaml.load(fs.readFileSync(zoneFile, 'utf8'));
        Object.assign(cfg, zoneConfig);
    }
    const file = find(configFile);
    if (file) {
        const config = yaml.load(fs.readFileSync(file, 'utf8'));
        cfg = mergeJSON.merge(cfg, config);
    }

    return cfg;
};
