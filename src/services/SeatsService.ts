// {}
import { Inject, Service } from 'typedi';
import { BookingsRepo, SeatsRepo } from '@footy/repositories';
import { Seats } from '@footy/entities';
import { id as generateId } from '@footy/fmk/libs/generator';

@Service()
export class SeatsService {
  @Inject()
  private seatsRepo: SeatsRepo;

  @Inject()
  private bookingsRepo: BookingsRepo;

  async findById(id: string): Promise<Seats | null> {
    return this.seatsRepo.findById(id);
  }

  async findByBookingId(bookingId: string): Promise<Seats[]> {
    return this.seatsRepo.findByBookingId(bookingId);
  }

  async findSeatByPosition(bookingId: string, rowLetter: string, seatNumber: number): Promise<Seats | null> {
    return this.seatsRepo.findSeatByPosition(bookingId, rowLetter, seatNumber);
  }

  async findAllSeatsForMovie(movieId: string): Promise<Seats[]> {
    return this.seatsRepo.findAllSeatsForMovie(movieId);
  }

  async createSeat(seatData: Partial<Seats>): Promise<Seats | null> {
    // Validate booking exists and required fields are present
    if (!seatData.bookingId || !seatData.rowLetter || seatData.seatNumber === undefined) {
      return null;
    }
    const booking = await this.bookingsRepo.findById(seatData.bookingId);
    if (!booking) {
      return null;
    }
    // Check if the seat is already taken for this booking
    const existingSeat = await this.findSeatByPosition(seatData.bookingId, seatData.rowLetter, seatData.seatNumber);
    if (existingSeat) {
      return null; // Seat already exists
    }

    const seat = {
      id: generateId(16),
      ...seatData,
    };

    return this.seatsRepo.createSeat(seat);
  }

  async createMultipleSeats(seats: Partial<Seats>[]): Promise<Seats[]> {
    // Add IDs to all seats
    const seatsWithIds = seats.map((seat) => ({
      id: generateId(16),
      ...seat,
    }));

    return this.seatsRepo.createMultipleSeats(seatsWithIds);
  }

  async updateSeat(id: string, seatData: Partial<Seats>): Promise<Seats | null> {
    const seat = await this.seatsRepo.findById(id);
    if (!seat) {
      return null;
    }

    // If changing position, check if the new position is already taken
    if ((seatData.rowLetter && seatData.rowLetter !== seat.rowLetter) || (seatData.seatNumber !== undefined && seatData.seatNumber !== seat.seatNumber)) {
      const bookingId = seatData.bookingId || seat.bookingId;
      const rowLetter = seatData.rowLetter || seat.rowLetter;
      const seatNumber = seatData.seatNumber !== undefined ? seatData.seatNumber : seat.seatNumber;

      const existingSeat = await this.findSeatByPosition(bookingId, rowLetter, seatNumber);

      if (existingSeat && existingSeat.id !== id) {
        return null; // New position is already taken
      }
    }

    return this.seatsRepo.updateSeat(id, seatData);
  }

  async deleteSeat(id: string): Promise<boolean> {
    const seat = await this.seatsRepo.findById(id);
    if (!seat) {
      return false;
    }

    return this.seatsRepo.deleteSeat(id);
  }

  async deleteByBookingId(bookingId: string): Promise<boolean> {
    return this.seatsRepo.deleteByBookingId(bookingId);
  }

  async isSeatAvailable(movieId: string, rowLetter: string, seatNumber: number): Promise<boolean> {
    const seats = await this.findAllSeatsForMovie(movieId);
    return !seats.some((seat) => seat.rowLetter === rowLetter && seat.seatNumber === seatNumber);
  }
}
