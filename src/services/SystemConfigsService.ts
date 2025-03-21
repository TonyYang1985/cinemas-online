import { Service } from 'typedi';
import { SystemConfigsRepo } from '@footy/repositories';
import { repo } from '@footy/fmk';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class SystemConfigsService {

  @InjectRepository(SystemConfigsRepo)
  private systemConfigsRepo: SystemConfigsRepo;

  async getConfigs() {
    return true;
    //return await this.systemConfigsRepo.find({ select: ['configName', 'configValue', 'scope'], where: { enabled: 1 } });
  }
}
