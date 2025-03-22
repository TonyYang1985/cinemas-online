// { }
import { Service } from 'typedi';
import { SystemConfigs } from '@footy/entities';
import { DataSource} from 'typeorm';
import { BaseRepository } from '@footy/fmk';

@Service()
export class SystemConfigsRepo extends BaseRepository<SystemConfigs> {

    constructor(dataSource: DataSource) {
        super(dataSource, SystemConfigs);
      }
    // Pass-through methods to repository
    async find(options?: any) {
        return this.repository.find(options);
    }

}