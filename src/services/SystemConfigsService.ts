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
  }
}
