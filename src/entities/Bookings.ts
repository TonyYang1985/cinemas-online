import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  RelationId,
} from "typeorm";
import { Seats } from "./Seats";
import { Movies } from "./Movies";

@Entity("bookings", { schema: "fotNet" })
export class Bookings {
  @Column("varchar", { primary: true, name: "id", length: 36 })
  id: string;

  @Column("varchar", { name: "booking_code", length: 10 })
  bookingCode: string;

  @Column("int", { name: "num_tickets" })
  numTickets: number;

  @Column("timestamp", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @OneToMany(() => Seats, (seats) => seats.booking)
  seats: Seats[];

  @ManyToOne(() => Movies, (movies) => movies.bookings, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "movie_id", referencedColumnName: "id" }])
  movie: Movies;

  @RelationId((bookings: Bookings) => bookings.movie)
  movieId: string | null;

  constructor(init?: Partial<Bookings>) {
    Object.assign(this, init);
  }
}
