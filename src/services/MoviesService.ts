// {}
import { Inject, Service } from 'typedi';
import { MoviesRepo } from '@footy/repositories';
import { Movies } from '@footy/entities';
import { CreateMoviesRequest, UpdateMoviesRequest } from '@footy/vo';
import { id as generateId } from '@footy/fmk/libs/generator';
import { SeatSelectionService } from '@footy/services/SeatSelectionService';
import { Logger } from '@footy/fmk';

@Service()
export class MoviesService {
  private logger = Logger.getLogger(MoviesService);

  @Inject()
  private moviesRepo: MoviesRepo;

  @Inject()
  private seatSelectionService: SeatSelectionService;

  async findById(id: string): Promise<Movies | null> {
    return this.moviesRepo.findById(id);
  }

  async findByTitle(title: string): Promise<Movies | null> {
    return this.moviesRepo.findByTitle(title);
  }

  async findAll(): Promise<Movies[]> {
    return this.moviesRepo.findAll();
  }

  async createMovie(request: CreateMoviesRequest): Promise<Movies> {
    this.logger.info('Creating movie:', request);
    const movie = {
      id: generateId(16),
      ...request,
    };

    // Create the movie
    const createdMovie = await this.moviesRepo.createMovie(movie);

    try {
      // Initialize default seat selection rules
      await this.seatSelectionService.initializeDefaultRules();
      this.logger.info(`Default seat selection rules initialized for movie: ${createdMovie.id}`);
    } catch (error) {
      this.logger.error('Failed to initialize default seat selection rules:', error);
      // We don't fail the movie creation if rules initialization fails
    }

    return createdMovie;
  }

  async updateMovie(id: string, request: UpdateMoviesRequest): Promise<Movies | null> {
    const movie = await this.moviesRepo.findById(id);
    if (!movie) {
      return null;
    }
    return this.moviesRepo.updateMovie(id, request);
  }

  async deleteMovie(id: string): Promise<boolean> {
    const movie = await this.moviesRepo.findById(id);
    if (!movie) {
      return false;
    }
    return this.moviesRepo.deleteMovie(id);
  }

  async getAvailableSeats(movieId: string): Promise<{ row: string; seatNumber: number }[]> {
    const movie = await this.moviesRepo.findById(movieId);
    if (!movie) {
      return [];
    }

    // Get all bookings for this movie with their seats
    // Instead of accessing repository directly, use a method from the repo
    const movieWithBookings = await this.findMovieWithBookingsAndSeats(movieId);

    if (!movieWithBookings || !movieWithBookings.bookings) {
      // No bookings, all seats are available
      return this.generateAllSeats(movie.totalRows, movie.seatsPerRow);
    }

    // Get all booked seats
    const bookedSeats: { row: string; seatNumber: number }[] = [];
    movieWithBookings.bookings.forEach((booking) => {
      if (booking.seats) {
        booking.seats.forEach((seat) => {
          bookedSeats.push({
            row: seat.rowLetter,
            seatNumber: seat.seatNumber,
          });
        });
      }
    });

    // Generate all possible seats
    const allSeats = this.generateAllSeats(movie.totalRows, movie.seatsPerRow);

    // Filter out booked seats
    return allSeats.filter((seat) => !bookedSeats.some((bookedSeat) => bookedSeat.row === seat.row && bookedSeat.seatNumber === seat.seatNumber));
  }

  // Helper method to get movie with bookings and seats
  private async findMovieWithBookingsAndSeats(movieId: string): Promise<Movies | null> {
    // This is a workaround to avoid accessing repository directly
    return this.moviesRepo.findById(movieId);
  }

  private generateAllSeats(totalRows: number, seatsPerRow: number): { row: string; seatNumber: number }[] {
    const seats: { row: string; seatNumber: number }[] = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substring(0, totalRows);

    for (let i = 0; i < rowLetters.length; i++) {
      const rowLetter = rowLetters[i];
      for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
        seats.push({
          row: rowLetter,
          seatNumber,
        });
      }
    }

    return seats;
  }
}
