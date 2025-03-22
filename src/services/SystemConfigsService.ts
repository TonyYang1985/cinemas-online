import { Inject, Service } from 'typedi';
import { SystemConfigsRepo } from '@footy/repositories';

@Service()
export class SystemConfigsService {

  @Inject()
  private systemConfigsRepo: SystemConfigsRepo;

  async getConfigs() {
    return await this.systemConfigsRepo.find({ select: ['configName', 'configValue', 'scope'], where: { enabled: 1 } });
  }
}
