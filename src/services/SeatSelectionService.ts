// {}
import { Inject, Service } from 'typedi';
import { MoviesRepo, SeatsRepo, SeatSelectionRulesRepo } from '@footy/repositories';
import { Seats, Movies, SeatSelectionRules } from '@footy/entities';
import { Logger } from '@footy/fmk';
import { id as generateId } from '@footy/fmk/libs/generator';

export interface SeatPosition {
  rowLetter: string;
  seatNumber: number;
}

export interface SeatAllocationRequest {
  movieId: string;
  numTickets: number;
  startingPosition?: SeatPosition;
}

@Service()
export class SeatSelectionService {
  private logger = Logger.getLogger(SeatSelectionService);

  @Inject()
  private moviesRepo: MoviesRepo;

  @Inject()
  private seatsRepo: SeatsRepo;

  @Inject()
  private seatSelectionRulesRepo: SeatSelectionRulesRepo;

  /**
   * Allocate seats based on the specified rules
   * @param bookingId The booking ID to associate with the seats
   * @param request The seat allocation request
   * @returns Array of allocated seats
   */
  async allocateSeats(bookingId: string, request: SeatAllocationRequest): Promise<Seats[]> {
    const movie = await this.moviesRepo.findById(request.movieId);
    if (!movie) {
      throw new Error('Movie not found');
    }

    // Get all existing seats for this movie
    const existingSeats = await this.seatsRepo.findAllSeatsForMovie(request.movieId);

    // Determine available seats
    const availableSeats = this.getAvailableSeats(movie, existingSeats);

    // Allocate seats based on rules
    const allocatedPositions = this.selectSeats(movie, availableSeats, request.numTickets, request.startingPosition);

    // Create seat entities
    const seatEntities: Partial<Seats>[] = allocatedPositions.map((position) => ({
      id: generateId(16),
      bookingId,
      rowLetter: position.rowLetter,
      seatNumber: position.seatNumber,
    }));

    // Save seats to database
    return this.seatsRepo.createMultipleSeats(seatEntities);
  }

  /**
   * Get a map of available seats for a movie
   * @param movie The movie to check
   * @param existingSeats Already booked seats
   * @returns Map of available seats by row
   */
  private getAvailableSeats(movie: Movies, existingSeats: Seats[]): Map<string, Set<number>> {
    // Create a map of all possible seats
    const availableSeats = new Map<string, Set<number>>();

    // Initialize with all seats
    for (let rowIndex = 0; rowIndex < movie.totalRows; rowIndex++) {
      const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, C, ...
      const rowSeats = new Set<number>();

      for (let seatNumber = 1; seatNumber <= movie.seatsPerRow; seatNumber++) {
        rowSeats.add(seatNumber);
      }

      availableSeats.set(rowLetter, rowSeats);
    }

    // Remove booked seats
    for (const seat of existingSeats) {
      const rowSeats = availableSeats.get(seat.rowLetter);
      if (rowSeats) {
        rowSeats.delete(seat.seatNumber);
      }
    }

    return availableSeats;
  }

  /**
   * Select seats based on the specified rules
   * @param movie The movie
   * @param availableSeats Map of available seats
   * @param numTickets Number of tickets to allocate
   * @param startingPosition Optional starting position
   * @returns Array of selected seat positions
   */
  private selectSeats(movie: Movies, availableSeats: Map<string, Set<number>>, numTickets: number, startingPosition?: SeatPosition): SeatPosition[] {
    // If starting position is specified, use custom allocation
    if (startingPosition) {
      return this.allocateFromSpecifiedPosition(movie, availableSeats, numTickets, startingPosition);
    }

    // Otherwise use default allocation
    return this.allocateUsingDefaultRules(movie, availableSeats, numTickets);
  }

  /**
   * Allocate seats using default rules
   * @param movie The movie
   * @param availableSeats Map of available seats
   * @param numTickets Number of tickets to allocate
   * @returns Array of selected seat positions
   */
  private allocateUsingDefaultRules(movie: Movies, availableSeats: Map<string, Set<number>>, numTickets: number): SeatPosition[] {
    const selectedSeats: SeatPosition[] = [];

    // Start from furthest row (Z -> A)
    const rows = Array.from(availableSeats.keys()).sort().reverse();

    for (const rowLetter of rows) {
      const rowSeats = availableSeats.get(rowLetter);
      if (!rowSeats || rowSeats.size === 0) continue;

      // Get middle-most seats
      const seatNumbers = Array.from(rowSeats).sort((a, b) => a - b);
      const middleIndex = Math.floor(movie.seatsPerRow / 2);

      // Sort seats by distance from middle
      const sortedByMiddle = seatNumbers.sort((a, b) => {
        return Math.abs(a - middleIndex) - Math.abs(b - middleIndex);
      });

      // Allocate as many seats as possible in this row
      for (const seatNumber of sortedByMiddle) {
        selectedSeats.push({ rowLetter, seatNumber });

        if (selectedSeats.length === numTickets) {
          return selectedSeats;
        }
      }
    }

    return selectedSeats;
  }

  /**
   * Allocate seats from a specified starting position
   * @param movie The movie
   * @param availableSeats Map of available seats
   * @param numTickets Number of tickets to allocate
   * @param startingPosition The starting position
   * @returns Array of selected seat positions
   */
  private allocateFromSpecifiedPosition(movie: Movies, availableSeats: Map<string, Set<number>>, numTickets: number, startingPosition: SeatPosition): SeatPosition[] {
    const selectedSeats: SeatPosition[] = [];

    // Get all rows in order from the starting row to the front
    const allRows = Array.from(availableSeats.keys()).sort();
    const startingRowIndex = allRows.indexOf(startingPosition.rowLetter);

    if (startingRowIndex === -1) {
      // Invalid starting row, fall back to default allocation
      return this.allocateUsingDefaultRules(movie, availableSeats, numTickets);
    }

    // Get rows from starting row to front
    const rows = allRows.slice(startingRowIndex);

    // First try to allocate in the starting row
    const startingRow = rows[0];
    const startingRowSeats = availableSeats.get(startingRow);

    if (startingRowSeats) {
      // Get seats from starting position to the right
      const seatNumbers = Array.from(startingRowSeats)
        .filter((seat) => seat >= startingPosition.seatNumber)
        .sort((a, b) => a - b);

      // Allocate seats in this row
      for (const seatNumber of seatNumbers) {
        selectedSeats.push({ rowLetter: startingRow, seatNumber });

        if (selectedSeats.length === numTickets) {
          return selectedSeats;
        }
      }
    }

    // If we need more seats, continue with default allocation for remaining rows
    if (selectedSeats.length < numTickets) {
      // Skip the starting row since we've already processed it
      const remainingRows = rows.slice(1);

      // Create a new map with only the remaining rows
      const remainingAvailableSeats = new Map<string, Set<number>>();
      for (const row of remainingRows) {
        remainingAvailableSeats.set(row, availableSeats.get(row) || new Set());
      }

      // Allocate remaining seats using default rules
      const remainingSeats = this.allocateUsingDefaultRules(movie, remainingAvailableSeats, numTickets - selectedSeats.length);

      selectedSeats.push(...remainingSeats);
    }

    return selectedSeats;
  }

  /**
   * Initialize default seat selection rules
   */
  async initializeDefaultRules(): Promise<SeatSelectionRules> {
    // Check if default rules already exist
    let defaultRules = await this.seatSelectionRulesRepo.findByName('Default');

    if (!defaultRules) {
      // Create default rules
      defaultRules = await this.seatSelectionRulesRepo.createRule({
        id: generateId(16),
        name: 'Default',
        description: 'Default seat selection rules',
        startFromFurthestRow: true,
        startFromMiddleCol: true,
        overflowToCloserRow: true,
      });
    }

    return defaultRules;
  }
}
