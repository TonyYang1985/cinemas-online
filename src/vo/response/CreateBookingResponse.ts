import { Bookings, Seats } from '@footy/entities';
import { AbstractBuilder, BaseResponse } from '@gaias/basenode';

import { Expose } from 'class-transformer';

@Expose()
export class CreateBookingResponse extends BaseResponse implements Partial<Bookings> {
  id: string;

  bookingCode: string;

  movieId: string;

  numTickets: number;

  seatsList: Partial<Seats>[];

  errorCode: string;

  errorMessage: string;

  static success(id: string, bookingCode: string, movieId: string, numTickets: number, seatsList?: Partial<Seats>[]): CreateBookingResponse {
    //eslint-disable-next-line
    return this.createBuilder()
      .with('id', id)
      .with('bookingCode', bookingCode)
      .with('movieId', movieId)
      .with('numTickets', numTickets)
      .with('seatsList', seatsList || [])
      .with('errorCode', '')
      .with('errorMessage', '')
      .build();
  }
}
