import { id, repo } from '@footy/fmk';
import { Service } from 'typedi';
import { SystemConfigs } from '@footy/entities';
import { SystemConfigsRepo } from '@footy/repositories';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class SystemConfigsService {

  @InjectRepository(SystemConfigsRepo)
  private systemConfigsRepo: SystemConfigsRepo;

  async getAllConfigs() {
    return await this.systemConfigsRepo.find({ select: ['configName', 'configValue', 'scope'], where: { enabled: 1 } });
    // const cfgObj: Record<string, Record<string, any>> = {};
    // configs
    //   .map((cfg) => {
    //     return {
    //       scope: cfg.scope,
    //       configName: cfg.configName,
    //       configValue: JSON.parse(cfg.configValue),
    //     };
    //   })
    //   .forEach((cfg) => {
    //     if (!cfgObj[cfg.scope]) {
    //       cfgObj[cfg.scope] = {};
    //     }
    //     cfgObj[cfg.scope][cfg.configName] = cfg.configValue;
    //   });
    // return cfgObj;
  }

  async getAllNames(scope: string) {
    const configs = await this.systemConfigsRepo.find({ select: ['configName'], where: { scope, enabled: 1 } });
    return configs.map((conf) => conf.configName);
  }

  async getConfig(scope: string, configName: string) {
    let config = await this.systemConfigsRepo.findOne({ select: ['configValue'], where: { scope, configName, enabled: 1 } });
    if (!config) {
      config = new SystemConfigs({ id: id(), scope, configName, enabled: 1, configValue: '{}' });
      await this.systemConfigsRepo.insert(config);
    }
    return JSON.parse(config.configValue);
  }
  async setValue(scope: string, configName: string, value: any) {
    let config = await this.systemConfigsRepo.findOne({ configName, scope });
    if (config) {
      config.enabled = 1;
    } else {
      config = new SystemConfigs({ id: id(), scope, configName, enabled: 1 });
    }
    config.configValue = JSON.stringify(value);
    await this.systemConfigsRepo.save(config);
  }

  async setEnable(scope: string, configName: string) {
    await this.systemConfigsRepo.update({ scope, configName }, { enabled: 1 });
  }

  async setDisable(scope: string, configName: string) {
    await this.systemConfigsRepo.update({ scope, configName }, { enabled: 0 });
  }
}
