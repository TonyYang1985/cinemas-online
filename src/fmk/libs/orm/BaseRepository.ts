// BaseRepository.ts
import { Repository, DataSource, FindOptionsWhere, ObjectLiteral } from 'typeorm';

export class BaseRepository<Entity extends ObjectLiteral> {
  protected repository: Repository<Entity>;
  
  constructor(
    protected dataSource: DataSource,
    protected entityClass: new () => Entity
  ) {
    this.repository = this.dataSource.getRepository(entityClass);
  }
  
  async find(options?: any) {
    return this.repository.find(options);
  }
  
  async findOne(options?: any) {
    return this.repository.findOne(options);
  }
  
  async findById(id: any) {
    return this.repository.findOneBy({ id } as FindOptionsWhere<Entity>);
  }
  
  async save(entity: Entity) {
    return this.repository.save(entity);
  }
  
  async update(criteria: any, partialEntity: Partial<Entity>) {
    return this.repository.update(criteria, partialEntity);
  }
  
  async delete(criteria: any) {
    return this.repository.delete(criteria);
  }
}