import { Entity, Column } from 'typeorm';

@Entity('seat_selection_rules', { schema: 'fotNet' })
export class SeatSelectionRules {
  @Column('varchar', { primary: true, name: 'id', length: 36 })
  id: string;

  @Column('varchar', { name: 'name', length: 255 })
  name: string;

  @Column('varchar', { name: 'description', length: 1000, nullable: true })
  description: string;

  @Column('boolean', { name: 'start_from_furthest_row', default: true })
  startFromFurthestRow: boolean;

  @Column('boolean', { name: 'start_from_middle_col', default: true })
  startFromMiddleCol: boolean;

  @Column('boolean', { name: 'overflow_to_closer_row', default: true })
  overflowToCloserRow: boolean;

  @Column('timestamp', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  constructor(init?: Partial<SeatSelectionRules>) {
    Object.assign(this, init);
  }
}
