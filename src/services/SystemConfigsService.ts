import { Service } from 'typedi';
import { SystemConfigs } from '@footy/entities';
import { FindOptionsWhere, Repository } from 'typeorm';
import { repo } from '@footy/fmk';

@Service()
export class SystemConfigsService {

  @repo.InjectRepository(SystemConfigs)
  private repository: Repository<SystemConfigs>;

  async getConfigs() {
    return await this.repository.find({ select: ['configName', 'configValue', 'scope'], where: { enabled: 1 } });
  }
}
