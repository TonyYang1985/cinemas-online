import { Inject, Service } from 'typedi';
import { BookingsRepo, SeatsRepo, MoviesRepo } from '@footy/repositories';
import { Seats, Bookings } from '@footy/entities';
import { CreateBookingRequest, UpdateBookingRequest, UpdateBookingSeatsRequest } from '@footy/vo';
import { id as generateId } from '@footy/fmk/libs/generator';
import { CreateBookingResponse } from '@footy/vo/response';
import { SeatSelectionService } from '@footy/services/SeatSelectionService';
import { Logger } from '@footy/fmk';

@Service()
export class BookingsService {
  private logger = Logger.getLogger(BookingsService);

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

  /**
   * Create a new booking with initial seat allocation
   * @param request The booking request
   * @returns Response with booking details or error
   */
  async createBooking(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    // Validate movie exists
    const movie = await this.moviesRepo.findById(request.movieId);
    if (!movie) {
      return CreateBookingResponse.error('ERROR_CODE1', 'movie not found');
    }
    // Check if there are enough seats available
    const existingBookings = await this.bookingsRepo.findByMovieId(request.movieId);
    const totalBookedSeats = existingBookings.reduce((total, booking) => total + booking.numTickets, 0);
    const totalSeats = movie.totalRows * movie.seatsPerRow;
    const availableSeats = totalSeats - totalBookedSeats;
    if (request.numTickets > availableSeats) {
      return CreateBookingResponse.error('ERROR_CODE4', `Sorry, there are only ${availableSeats} seats available.`);
    }

    // Generate a unique booking code (GIC####)
    const bookingCode = await this.generateBookingCode();
    // Create the booking
    const booking = await this.bookingsRepo.createBooking({
      id: generateId(16),
      bookingCode,
      movieId: request.movieId,
      numTickets: request.numTickets,
    });

    // Use seat selection service to allocate seats
    //let seats: Seats[] = [];

    // try {
    //   // Allocate seats based on rules (with optional starting position)
    //   let startingPosition;
    //   if (request.rowLetter && request.seatNumber) {
    //     startingPosition = {
    //       rowLetter: request.rowLetter,
    //       seatNumber: request.seatNumber,
    //     };
    //   }

    //   seats = await this.seatSelectionService.allocateSeats(booking.id, {
    //     movieId: request.movieId,
    //     numTickets: request.numTickets,
    //     startingPosition,
    //   });
    // } catch (error) {
    //   // If seat allocation fails, delete the booking and return error
    //   await this.bookingsRepo.deleteBooking(booking.id);
    //   return CreateBookingResponse.error('ERROR_CODE3', 'failed to allocate seats');
    // }

    // Return the booking with seats
    // const seatsList = seats.map((seat) => ({
    //   id: seat.id,
    //   bookingId: seat.bookingId,
    //   rowLetter: seat.rowLetter,
    //   seatNumber: seat.seatNumber,
    // }));
    return CreateBookingResponse.success(booking.id, bookingCode, request.movieId, request.numTickets, []);
  }

  /**
   * Update seats for an existing booking based on user's selected starting position
   * @param request The seat update request
   * @returns Response with updated booking details or error
   */
  async updateBookingSeats(request: UpdateBookingSeatsRequest): Promise<CreateBookingResponse> {
    // Find the booking
    const booking = await this.bookingsRepo.findById(request.bookingId);
    if (!booking) {
      return CreateBookingResponse.error('ERROR_CODE5', 'booking not found');
    }

    // Delete existing seats
    await this.seatsRepo.deleteByBookingId(request.bookingId);

    // Allocate new seats based on the starting position
    let seats: Seats[] = [];
    try {
      const startingPosition = {
        rowLetter: request.rowLetter,
        seatNumber: request.seatNumber,
      };

      seats = await this.seatSelectionService.allocateSeats(request.bookingId, {
        movieId: booking.movieId,
        numTickets: booking.numTickets,
        startingPosition,
      });
    } catch (error) {
      // If seat allocation fails, try to restore original seats
      return CreateBookingResponse.error('ERROR_CODE6', 'failed to update seats');
    }

    // Return the updated booking with new seats
    const seatsList = seats.map((seat) => ({
      id: seat.id,
      bookingId: seat.bookingId,
      rowLetter: seat.rowLetter,
      seatNumber: seat.seatNumber,
    }));

    return CreateBookingResponse.success(booking.id, booking.bookingCode, booking.movieId, booking.numTickets, seatsList);
  }

  async updateBooking(id: string, request: UpdateBookingRequest): Promise<Bookings | null> {
    const booking = await this.bookingsRepo.findById(id);
    if (!booking) {
      return null;
    }

    // Update booking data if provided
    if (request.bookingData) {
      // 直接传递整个request对象，让BookingsRepo处理
      await this.bookingsRepo.updateBooking(id, request);
    }

    // Update seats if requested
    if (request.updateSeats) {
      // First delete existing seats
      await this.seatsRepo.deleteByBookingId(id);

      // Then create new seats
      if (request.seats && request.seats.length > 0) {
        // Create the seats as specified by the user
        const seatsList: Partial<Seats>[] = request.seats.map((seat) => ({
          id: generateId(16),
          bookingId: id,
          rowLetter: seat.rowLetter,
          seatNumber: seat.seatNumber,
        }));
        await this.seatsRepo.createMultipleSeats(seatsList);
      } else {
        // Auto-allocate seats based on rules
        const movie = await this.moviesRepo.findById(booking.movieId);
        if (!movie) {
          return null;
        }

        const numTickets = request.bookingData?.numTickets || booking.numTickets;
        let startingPosition;
        if (request.startingPosition) {
          startingPosition = {
            rowLetter: request.startingPosition.rowLetter,
            seatNumber: request.startingPosition.seatNumber,
          };
        }

        try {
          await this.seatSelectionService.allocateSeats(id, {
            movieId: booking.movieId,
            numTickets,
            startingPosition,
          });
        } catch (error) {
          // If seat allocation fails, log error but don't fail the update
          this.logger.error('Failed to allocate seats', error);
        }
      }
    }

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

  private async generateBookingCode(): Promise<string> {
    try {
      // Get the count of existing bookings to determine the next number
      const count = await this.bookingsRepo.getBookingCount();
      // Format as GIC#### with leading zeros
      const nextNumber = count + 1;
      return `GIC${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      // Fallback to GIC0001 if count fails
      return 'GIC0001';
    }
  }
}
