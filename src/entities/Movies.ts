import { Column, Entity, OneToMany } from 'typeorm';
import { Bookings } from './Bookings';

@Entity('movies', { schema: 'fotNet' })
export class Movies {
  @Column('varchar', { primary: true, name: 'id', length: 36 })
  id: string;

  @Column('varchar', { name: 'title', length: 255 })
  title: string;

  @Column('int', { name: 'total_rows' })
  totalRows: number;

  @Column('int', { name: 'seats_per_row' })
  seatsPerRow: number;

  @Column('varchar', { name: 'sort', length: 15 })
  sort: string;

  @Column('timestamp', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => Bookings, (bookings) => bookings.movie)
  bookings: Bookings[];

  constructor(init?: Partial<Movies>) {
    Object.assign(this, init);
  }
}
