import { Service } from 'typedi';
import { Inject } from 'typedi';
import { SystemConfigsRepo } from '../repositories/SystemConfigsRepo';

@Service()
export class SystemConfigsService {
  @Inject()
  private systemConfigsRepo: SystemConfigsRepo;

  async getConfigs() {
    return await this.systemConfigsRepo.find({ select: ['configName', 'configValue', 'scope'], where: { enabled: 1 } });
  }
}