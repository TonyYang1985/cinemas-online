// {}
import { Service } from 'typedi';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@footy/fmk';
import { Seats } from '@footy/entities';

@Service()
export class SeatsRepo extends BaseRepository<Seats> {
  constructor(dataSource: DataSource) {
    super(dataSource, Seats);
  }

  async findById(id: string): Promise<Seats | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByBookingId(bookingId: string): Promise<Seats[]> {
    return this.repository.find({ where: { bookingId } });
  }

  async findSeatByPosition(bookingId: string, rowLetter: string, seatNumber: number): Promise<Seats | null> {
    return this.repository.findOne({
      where: {
        bookingId,
        rowLetter,
        seatNumber,
      },
    });
  }

  async findAllSeatsForMovie(movieId: string): Promise<Seats[]> {
    return this.repository.createQueryBuilder('seat').innerJoin('seat.booking', 'booking').where('booking.movieId = :movieId', { movieId }).getMany();
  }

  async createSeat(seat: Partial<Seats>): Promise<Seats> {
    const newSeat = this.repository.create(seat);
    return this.repository.save(newSeat);
  }

  async createMultipleSeats(seats: Partial<Seats>[]): Promise<Seats[]> {
    const newSeats = seats.map((seat) => this.repository.create(seat));
    return this.repository.save(newSeats);
  }

  async updateSeat(id: string, seatData: Partial<Seats>): Promise<Seats | null> {
    await this.repository.update(id, seatData);
    return this.findById(id);
  }

  async deleteSeat(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async deleteByBookingId(bookingId: string): Promise<boolean> {
    const result = await this.repository.delete({ bookingId });
    return result.affected ? result.affected > 0 : false;
  }
}
