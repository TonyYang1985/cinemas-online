import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Movies, Seats } from '@footy/entities';

@Entity('bookings', { schema: 'fotNet' })
export class Bookings {
  @Column('varchar', { primary: true, name: 'id', length: 36 })
  id: string;

  @Column('varchar', { name: 'booking_code', length: 10 })
  bookingCode: string;

  @Column('varchar', { name: 'movie_id', length: 36 })
  movieId: string;

  @Column('int', { name: 'num_tickets' })
  numTickets: number;

  @Column('timestamp', { name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => Movies, (movie) => movie.bookings)
  @JoinColumn({ name: 'movie_id' })
  movie: Movies;

  @OneToMany(() => Seats, (seat) => seat.booking)
  seats: Seats[];

  constructor(init?: Partial<Bookings>) {
    Object.assign(this, init);
  }
}
