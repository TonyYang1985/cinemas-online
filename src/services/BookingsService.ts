// {}
import { Inject, Service } from 'typedi';
import { BookingsRepo, SeatsRepo, MoviesRepo } from '@footy/repositories';
import { Seats, Bookings } from '@footy/entities';
import { CreateBookingRequest, UpdateBookingRequest } from '@footy/vo';
import { id as generateId } from '@footy/fmk/libs/generator';
import { CreateBookingResponse } from '@footy/vo/response';

@Service()
export class BookingsService {
  @Inject()
  private bookingsRepo: BookingsRepo;

  @Inject()
  private seatsRepo: SeatsRepo;

  @Inject()
  private moviesRepo: MoviesRepo;

  async findById(id: string): Promise<Bookings | null> {
    return this.bookingsRepo.findById(id);
  }

  async findByBookingCode(bookingCode: string): Promise<Bookings | null> {
    return this.bookingsRepo.findByBookingCode(bookingCode);
  }

  async findByMovieId(movieId: string): Promise<Bookings[]> {
    return this.bookingsRepo.findByMovieId(movieId);
  }

  async findAll(): Promise<Bookings[]> {
    return this.bookingsRepo.findAll();
  }

  async findAllWithSeats(): Promise<Bookings[]> {
    return this.bookingsRepo.findAllWithSeats();
  }

  async findByIdWithSeats(id: string): Promise<Bookings | null> {
    return this.bookingsRepo.findByIdWithSeats(id);
  }

  async findByBookingCodeWithSeats(bookingCode: string): Promise<Bookings | null> {
    return this.bookingsRepo.findByBookingCodeWithSeats(bookingCode);
  }

  async createBooking(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    // Validate movie exists
    const movie = await this.moviesRepo.findById(request.booking.movieId);
    if (!movie) {
      return CreateBookingResponse.error('ERROR_CODE1', 'movie not found');
    }
    // Validate number of tickets matches number of seats
    if (request.booking.numTickets !== request.seats.length) {
      return CreateBookingResponse.error('ERROR_CODE2', 'number of tickets does not match number of seats');
    }
    // Generate a unique booking code (6 alphanumeric characters)
    const bookingCode = this.generateBookingCode();

    // Create the booking
    const booking = await this.bookingsRepo.createBooking({
      id: generateId(16),
      bookingCode,
      movieId: request.booking.movieId,
      numTickets: request.booking.numTickets,
    });

    // Create the seats
    const seatsList: Partial<Seats>[] = request.seats.map((seat) => ({
      id: generateId(16),
      bookingId: booking.id,
      rowLetter: seat.rowLetter,
      seatNumber: seat.seatNumber,
    }));
    await this.seatsRepo.createMultipleSeats(seatsList);
    // Return the booking with seats
    return CreateBookingResponse.success(booking.id, bookingCode, request.booking.movieId, request.booking.numTickets, seatsList);
  }

  async updateBooking(id: string, request: UpdateBookingRequest): Promise<Bookings | null> {
    const booking = await this.bookingsRepo.findById(id);
    if (!booking) {
      return null;
    }

    // Update booking
    await this.bookingsRepo.updateBooking(id, request);
    // If seats are provided, update them
    if (request.seats && request.seats.length > 0) {
      // Delete existing seats
      await this.seatsRepo.deleteByBookingId(id);
      // Create new seats
      const seatEntities = request.seats.map((seat) => ({
        id: generateId(16),
        bookingId: id,
        rowLetter: seat.rowLetter,
        seatNumber: seat.seatNumber,
      }));

      await this.seatsRepo.createMultipleSeats(seatEntities);
    }
    // Return updated booking with seats
    return this.bookingsRepo.findByIdWithSeats(id);
  }

  async deleteBooking(id: string): Promise<boolean> {
    const booking = await this.bookingsRepo.findById(id);
    if (!booking) {
      return false;
    }

    // Delete associated seats first
    await this.seatsRepo.deleteByBookingId(id);

    // Delete the booking
    return this.bookingsRepo.deleteBooking(id);
  }

  async getBookingSeats(bookingId: string): Promise<Seats[]> {
    return this.seatsRepo.findByBookingId(bookingId);
  }

  private generateBookingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
