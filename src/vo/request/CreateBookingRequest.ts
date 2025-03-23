import { Expose } from 'class-transformer';
import { IsArray, IsNumber, Length, Matches, Max, Min } from 'class-validator';
import { i18n } from '@footy/fmk/libs/validator';

@Expose()
export class CreateBookingVo {
  @i18n(Length, 1, 36)
  @Expose()
  movieId: string;

  @i18n(IsNumber)
  @i18n(Min, 1)
  @i18n(Max, 50)
  @Expose()
  numTickets: number;
}

@Expose()
export class CreateBookingSeatsVo {
  @i18n(Length, 1, 1)
  @i18n(Matches, /^[A-Za-z]$/)
  @Expose()
  rowLetter: string;

  @i18n(IsNumber)
  @i18n(Min, 1)
  @i18n(Max, 50)
  @Expose()
  seatNumber: number;
}

@Expose()
export class CreateBookingRequest {
  booking: CreateBookingVo;

  seats: CreateBookingSeatsVo[];
}

@Expose()
export class UpdateBookingVo {
  @i18n(Length, 1, 36)
  @Expose()
  bookingCode: string;

  @i18n(Length, 1, 36)
  @Expose()
  movieId: string;

  @i18n(IsNumber)
  @i18n(Min, 1)
  @i18n(Max, 50)
  @Expose()
  numTickets: number;
}

@Expose()
export class UpdateBookingRequest {
  @Expose()
  bookingData: UpdateBookingVo;

  @i18n(IsArray)
  @Expose()
  seats: CreateBookingSeatsVo[];
}
