import { Get, JsonController, Logger, Post, Put, Delete } from '@footy/fmk';
import { Inject } from 'typedi';
import { Seats, Bookings } from '@footy/entities';
import { BookingsService } from '@footy/services';
import { Body, Param } from 'routing-controllers';
import { CreateBookingRequest, UpdateBookingRequest } from '@footy/vo';
import { CreateBookingResponse } from '@footy/vo/response';

@JsonController('/bookings')
export class BookingsController {
  private logger = Logger.getLogger(BookingsController);

  @Inject()
  private bookingsService: BookingsService;

  @Get('', '*', 'cinemas-online.bookings.getAll')
  async getAllBookings(): Promise<Bookings[]> {
    return this.bookingsService.findAll();
  }

  @Get('/with-seats', '*', 'cinemas-online.bookings.getAllWithSeats')
  async getAllBookingsWithSeats(): Promise<Bookings[]> {
    return this.bookingsService.findAllWithSeats();
  }

  @Get('/:id', '*', 'cinemas-online.bookings.getById')
  async getBookingById(@Param('id') id: string): Promise<Bookings | null> {
    return this.bookingsService.findById(id);
  }

  @Get('/:id/with-seats', '*', 'cinemas-online.bookings.getByIdWithSeats')
  async getBookingByIdWithSeats(@Param('id') id: string): Promise<Bookings | null> {
    return this.bookingsService.findByIdWithSeats(id);
  }

  @Get('/code/:bookingCode', '*', 'cinemas-online.bookings.getByCode')
  async getBookingByCode(@Param('bookingCode') bookingCode: string): Promise<Bookings | null> {
    return this.bookingsService.findByBookingCode(bookingCode);
  }

  @Get('/code/:bookingCode/with-seats', '*', 'cinemas-online.bookings.getByCodeWithSeats')
  async getBookingByCodeWithSeats(@Param('bookingCode') bookingCode: string): Promise<Bookings | null> {
    return this.bookingsService.findByBookingCodeWithSeats(bookingCode);
  }

  @Get('/movie/:movieId', '*', 'cinemas-online.bookings.getByMovieId')
  async getBookingsByMovieId(@Param('movieId') movieId: string): Promise<Bookings[]> {
    return this.bookingsService.findByMovieId(movieId);
  }

  @Get('/:id/seats', '*', 'cinemas-online.bookings.getSeats')
  async getBookingSeats(@Param('id') id: string): Promise<Seats[]> {
    return this.bookingsService.getBookingSeats(id);
  }

  @Post('', '*', 'cinemas-online.bookings.create')
  async createBooking(@Body() request: CreateBookingRequest): Promise<CreateBookingResponse> {
    return this.bookingsService.createBooking(request);
  }

  @Put('/:id', '*', 'cinemas-online.bookings.update')
  async updateBooking(@Param('id') id: string, @Body() request: UpdateBookingRequest): Promise<Bookings | null> {
    return this.bookingsService.updateBooking(id, request);
  }

  @Delete('/:id', '*', 'cinemas-online.bookings.delete')
  async deleteBooking(@Param('id') id: string): Promise<void> {
    await this.bookingsService.deleteBooking(id);
  }
}
