import { loadConfig } from '@footy/fmk/utils/YamlUtil';

export type ConfigMap = { [key: string]: unknown };

export class ConfigManager {
    private _config: ConfigMap = {};
    static readonly nodeEnv = process.env.NODE_ENV;
    private static instance = new ConfigManager();
    public static basePath = '';
    private constructor() { }

    get config(): ConfigMap {
        return this._config;
    }
    static isDevelopment(): boolean {
        return ConfigManager.nodeEnv === 'development';
    }
    static isProduction(): boolean {
        return ConfigManager.nodeEnv === 'production';
    }
    load(...files: string[]): void {
        files.forEach((f) => {
            if (!this._config[f]) {
                this._config[f] = loadConfig(f);
            }
        });
    }

    createConfig<T>(file: string): T {
        const cfg = this._config[file];
        return cfg as T;
    }

    static getInstance(): ConfigManager {
        return ConfigManager.instance;
    }

    static getConfig<T>(configFile: string): T {
        const cfgmgr = ConfigManager.getInstance();
        cfgmgr.load(configFile);
        return cfgmgr.createConfig<T>(configFile);
    }

    static getPkgVersion() {
        const appDir = process.cwd();
        const pkgVersion = require(`${appDir}/package.json`).version;
        return pkgVersion;
    }

    static getBuildNumber() {
        const appDir = process.cwd();
        const buildNumber = require(`${appDir}/package.json`).buildNumber;
        return buildNumber;
    }
}