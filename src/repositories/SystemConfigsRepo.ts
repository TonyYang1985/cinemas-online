// { }
import { Service } from 'typedi';
import { SystemConfigs } from '@footy/entities';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class SystemConfigsRepo {
    constructor(
        @InjectRepository(SystemConfigs)
        private repository: Repository<SystemConfigs>
    ) {}

    // Custom methods
    findByName(name: string) {
        return this.repository.findOne({ where: { configName:name } });
    }

    async find(options?: any) {
        return this.repository.find(options);
    }

    async findOne(options?: any) {
        if (typeof options === 'object' && options.where) {
            return this.repository.findOne(options);
        }
        return this.repository.findOneBy(options as FindOptionsWhere<SystemConfigs>);
    }

    async save(entity: SystemConfigs | Partial<SystemConfigs>) {
        return this.repository.save(entity);
    }

    async insert(entity: SystemConfigs | Partial<SystemConfigs>) {
        return this.repository.insert(entity);
    }
}