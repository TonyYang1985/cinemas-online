// {}
import { Inject, Service } from 'typedi';
import { BookingsRepo, SeatsRepo, MoviesRepo } from '@footy/repositories';
import { Seats, Bookings } from '@footy/entities';
import { CreateBookingRequest, UpdateBookingRequest } from '@footy/vo';
import { id as generateId } from '@footy/fmk/libs/generator';
import { CreateBookingResponse } from '@footy/vo/response';
import { SeatSelectionService, SeatPosition } from '../services/SeatSelectionService';

@Service()
export class BookingsService {
  @Inject()
  private bookingsRepo: BookingsRepo;

  @Inject()
  private seatsRepo: SeatsRepo;

  @Inject()
  private moviesRepo: MoviesRepo;

  @Inject()
  private seatSelectionService: SeatSelectionService;

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

    // Generate a unique booking code (6 alphanumeric characters)
    const bookingCode = this.generateBookingCode();

    // Create the booking
    const booking = await this.bookingsRepo.createBooking({
      id: generateId(16),
      bookingCode,
      movieId: request.booking.movieId,
      numTickets: request.booking.numTickets,
    });

    // Use seat selection service to allocate seats
    let seats: Seats[] = [];

    if (request.seats && request.seats.length > 0) {
      // User has specified seats
      if (request.seats.length !== request.booking.numTickets) {
        return CreateBookingResponse.error('ERROR_CODE2', 'number of tickets does not match number of seats');
      }
      
      // Create the seats as specified by the user
      const seatsList: Partial<Seats>[] = request.seats.map((seat) => ({
        id: generateId(16),
        bookingId: booking.id,
        rowLetter: seat.rowLetter,
        seatNumber: seat.seatNumber,
      }));
      seats = await this.seatsRepo.createMultipleSeats(seatsList);
    } else {
      // Auto-allocate seats based on rules
      try {
        const startingPosition = request.startingPosition ? {
          rowLetter: request.startingPosition.rowLetter,
          seatNumber: request.startingPosition.seatNumber,
        } : undefined;
        
        seats = await this.seatSelectionService.allocateSeats(booking.id, {
          movieId: request.booking.movieId,
          numTickets: request.booking.numTickets,
          startingPosition,
        });
      } catch (error) {
        // If seat allocation fails, delete the booking and return error
        await this.bookingsRepo.deleteBooking(booking.id);
        return CreateBookingResponse.error('ERROR_CODE3', 'failed to allocate seats');
      }
    }

    // Return the booking with seats
    const seatsList = seats.map((seat) => ({
      id: seat.id,
      bookingId: seat.bookingId,
      rowLetter: seat.rowLetter,
      seatNumber: seat.seatNumber,
    }));
    
    return CreateBookingResponse.success(booking.id, bookingCode, request.booking.movieId, request.booking.numTickets, seatsList);
  }

  async updateBooking(id: string, request: UpdateBookingRequest): Promise<Bookings | null> {
    const booking = await this.bookingsRepo.findById(id);
    if (!booking) {
      return null;
    }

    // Update booking
    await this.bookingsRepo.updateBooking(id, request);
    
    // Handle seat updates
    if (request.updateSeats) {
      // Delete existing seats
      await this.seatsRepo.deleteByBookingId(id);
      
      // Allocate new seats
      if (request.seats && request.seats.length > 0) {
        // User has specified seats
        const seatEntities = request.seats.map((seat) => ({
          id: generateId(16),
          bookingId: id,
          rowLetter: seat.rowLetter,
          seatNumber: seat.seatNumber,
        }));

        await this.seatsRepo.createMultipleSeats(seatEntities);
      } else {
        // Auto-allocate seats based on rules
        const movie = await this.moviesRepo.findById(booking.movieId);
        if (!movie) {
          return null;
        }
        
        const numTickets = request.bookingData?.numTickets || booking.numTickets;
        const startingPosition = request.startingPosition ? {
          rowLetter: request.startingPosition.rowLetter,
          seatNumber: request.startingPosition.seatNumber,
        } : undefined;
        
        try {
          await this.seatSelectionService.allocateSeats(id, {
            movieId: booking.movieId,
            numTickets,
            startingPosition,
          });
        } catch (error) {
          // If seat allocation fails, return the booking without updating seats
          return this.bookingsRepo.findByIdWithSeats(id);
        }
      }
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
