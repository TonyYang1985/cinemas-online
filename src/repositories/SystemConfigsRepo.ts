// { }
import { Inject, Service } from 'typedi';
import { SystemConfigs } from '@footy/entities';
import { DataSource, Repository } from 'typeorm';

@Service()
export class SystemConfigsRepo {
    private repository: Repository<SystemConfigs>;

    constructor(
        @Inject('typeorm.connection.default') // specify the token
        private dataSource: DataSource
    ) {
        this.repository = this.dataSource.getRepository(SystemConfigs);
    }

    // Custom methods
    findByName(name: string) {
        return this.repository.findOne({ where: { configName: name } });
    }
    
    // Pass-through methods to repository
    async find(options?: any) {
        return this.repository.find(options);
    }

    async findOne(options?: any) {
        return this.repository.findOne(options);
    }

    async save(entity: SystemConfigs) {
        return this.repository.save(entity);
    }

    async update(criteria: any, partialEntity: Partial<SystemConfigs>) {
        return this.repository.update(criteria, partialEntity);
    }

    async delete(criteria: any) {
        return this.repository.delete(criteria);
    }
}