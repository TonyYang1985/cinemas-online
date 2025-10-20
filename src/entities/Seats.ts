import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { Bookings } from "./Bookings";

@Entity("seats", { schema: "fotNet" })
export class Seats {
  @Column("varchar", { primary: true, name: "id", length: 36 })
  id: string;

  @Column("char", { name: "row_letter", length: 1 })
  rowLetter: string;

  @Column("int", { name: "seat_number" })
  seatNumber: number;

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

  @ManyToOne(() => Bookings, (bookings) => bookings.seats, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
  booking: Bookings;

  @RelationId((seats: Seats) => seats.booking)
  bookingId: string | null;

  constructor(init?: Partial<Seats>) {
    Object.assign(this, init);
  }
}
