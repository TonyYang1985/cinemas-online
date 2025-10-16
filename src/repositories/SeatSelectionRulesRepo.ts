// {}
import { Service } from 'typedi';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@gaias/basenode';
import { SeatSelectionRules } from '@footy/entities';

@Service()
export class SeatSelectionRulesRepo extends BaseRepository<SeatSelectionRules> {
  constructor(dataSource: DataSource) {
    super(dataSource, SeatSelectionRules);
  }

  async findById(id: string): Promise<SeatSelectionRules | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<SeatSelectionRules | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findAll(): Promise<SeatSelectionRules[]> {
    return this.repository.find();
  }

  async createRule(rule: Partial<SeatSelectionRules>): Promise<SeatSelectionRules> {
    const newRule = this.repository.create(rule);
    return this.repository.save(newRule);
  }

  async updateRule(id: string, ruleData: Partial<SeatSelectionRules>): Promise<SeatSelectionRules | null> {
    await this.repository.update(id, ruleData);
    return this.findById(id);
  }

  async deleteRule(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
