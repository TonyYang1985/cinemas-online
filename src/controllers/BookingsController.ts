import { Get, JsonController, Logger, Post, Put, Delete, ct, rest } from '@gaias/basenode';
import { Inject } from 'typedi';
import { Seats, Bookings } from '@footy/entities';
import { BookingsService } from '@footy/services/BookingsService';
import { CreateBookingRequest, UpdateBookingRequest, UpdateBookingSeatsRequest } from '@footy/vo';
import { CreateBookingResponse } from '@footy/vo/response';
import { Body, Param } from 'routing-controllers';

@JsonController('/bookings')
export class BookingsController {
  private logger = Logger.getLogger(BookingsController);

  @Inject()
  private bookingsService: BookingsService;

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
  async createBooking(@rest.Body() request: CreateBookingRequest): Promise<CreateBookingResponse> {
    return this.bookingsService.createBooking(request);
  }

  @Put('/:id/seats', '*', 'cinemas-online.bookings.updateSeats')
  async updateBookingSeats(@Param('id') id: string, @Body() request: UpdateBookingSeatsRequest): Promise<CreateBookingResponse> {
    // 确保请求中包含bookingId
    request.bookingId = id;
    return this.bookingsService.updateBookingSeats(request);
  }

  @Put('/:id', '*', 'cinemas-online.bookings.update')
  async updateBooking(@Param('id') id: string, @Body() request: UpdateBookingRequest): Promise<Bookings | null> {
    return this.bookingsService.updateBooking(id, request);
  }
}
