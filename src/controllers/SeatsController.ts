import { Get, JsonController, Logger, Post, Put, Delete } from '@gaias/basenode';
import { Inject } from 'typedi';
import { Seats } from '@footy/entities';
import { SeatsService } from '@footy/services';
import { Body, Param } from 'routing-controllers';
import { CreateSeatsRequest, UpdateSeatsRequest } from '@footy/vo';

@JsonController('/seats')
export class SeatsController {
  private logger = Logger.getLogger(SeatsController);

  @Inject()
  private seatsService: SeatsService;

  @Get('/:id', '*', 'cinemas-online.seats.getById')
  async getSeatById(@Param('id') id: string): Promise<Seats | null> {
    return this.seatsService.findById(id);
  }

  @Get('/booking/:bookingId', '*', 'cinemas-online.seats.getByBookingId')
  async getSeatsByBookingId(@Param('bookingId') bookingId: string): Promise<Seats[]> {
    return this.seatsService.findByBookingId(bookingId);
  }

  @Get('/movie/:movieId', '*', 'cinemas-online.seats.getByMovieId')
  async getAllSeatsForMovie(@Param('movieId') movieId: string): Promise<Seats[]> {
    return this.seatsService.findAllSeatsForMovie(movieId);
  }

  @Get('/check-availability/:movieId/:rowLetter/:seatNumber', '*', 'cinemas-online.seats.checkAvailability')
  async checkSeatAvailability(
    @Param('movieId') movieId: string,
    @Param('rowLetter') rowLetter: string,
    @Param('seatNumber') seatNumber: number,
  ): Promise<{ available: boolean }> {
    const isAvailable = await this.seatsService.isSeatAvailable(movieId, rowLetter, seatNumber);
    return { available: isAvailable };
  }

  @Post('', '*', 'cinemas-online.seats.create')
  async createSeat(@Body() request: CreateSeatsRequest): Promise<Seats | null> {
    return this.seatsService.createSeat(request);
  }

  @Post('/multiple', '*', 'cinemas-online.seats.createMultiple')
  async createMultipleSeats(@Body() request: CreateSeatsRequest[]): Promise<Seats[]> {
    return this.seatsService.createMultipleSeats(request);
  }

  @Put('/:id', '*', 'cinemas-online.seats.update')
  async updateSeat(@Param('id') id: string, @Body() request: UpdateSeatsRequest): Promise<Seats | null> {
    return this.seatsService.updateSeat(id, request);
  }

  @Delete('/:id', '*', 'cinemas-online.seats.delete')
  async deleteSeat(@Param('id') id: string): Promise<void> {
    await this.seatsService.deleteSeat(id);
  }

  @Delete('/booking/:bookingId', '*', 'cinemas-online.seats.deleteByBookingId')
  async deleteByBookingId(@Param('bookingId') bookingId: string): Promise<void> {
    await this.seatsService.deleteByBookingId(bookingId);
  }
}
