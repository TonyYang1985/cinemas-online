// {}
import { Service } from 'typedi';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@footy/fmk';
import { Bookings } from '@footy/entities';
import { UpdateBookingRequest } from '@footy/vo';

@Service()
export class BookingsRepo extends BaseRepository<Bookings> {
  constructor(dataSource: DataSource) {
    super(dataSource, Bookings);
  }

  async findById(id: string): Promise<Bookings | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByBookingCode(bookingCode: string): Promise<Bookings | null> {
    return this.repository.findOne({ where: { bookingCode } });
  }

  async findByMovieId(movieId: string): Promise<Bookings[]> {
    return this.repository.find({ where: { movieId } });
  }

  async findAll(): Promise<Bookings[]> {
    return this.repository.find();
  }

  async findAllWithSeats(): Promise<Bookings[]> {
    return this.repository.find({ relations: ['seats'] });
  }

  async findByIdWithSeats(id: string): Promise<Bookings | null> {
    return this.repository.findOne({ where: { id }, relations: ['seats'] });
  }

  async findByBookingCodeWithSeats(bookingCode: string): Promise<Bookings | null> {
    return this.repository.findOne({ where: { bookingCode }, relations: ['seats'] });
  }

  async createBooking(booking: Partial<Bookings>): Promise<Bookings> {
    const newBooking = this.repository.create(booking);
    return this.repository.save(newBooking);
  }

  async updateBooking(id: string, request: UpdateBookingRequest): Promise<Bookings | null> {
    await this.repository.update(id, request.bookingData);
    return this.findById(id);
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
