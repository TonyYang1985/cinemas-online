import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Bookings } from '@footy/entities';

@Entity('seats', { schema: 'fotNet' })
export class Seats {
  @Column('varchar', { primary: true, name: 'id', length: 36 })
  id: string;

  @Column('varchar', { name: 'booking_id', length: 36 })
  bookingId: string;

  @Column('char', { name: 'row_letter', length: 1 })
  rowLetter: string;

  @Column('int', { name: 'seat_number' })
  seatNumber: number;

  @Column('timestamp', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Bookings, (bookings) => bookings.seats)
  @JoinColumn({ name: 'booking_id' })
  booking: Bookings;

  constructor(init?: Partial<Seats>) {
    Object.assign(this, init);
  }
}
