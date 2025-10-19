import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, Length, Matches, Max, Min } from 'class-validator';
import { i18n } from '@gaias/basenode';
import { ct } from '@gaias/basenode';

@Expose()
export class CreateBookingRequest {
  @i18n(Length, 1, 36)
  @Expose()
  movieId: string;

  @i18n(IsNumber)
  @i18n(Min, 1)
  @i18n(Max, 50)
  @Expose()
  numTickets: number;
}

@ct.Expose()
export class CreateBookingVo {
  @i18n(Length, 1, 36)
  @ct.Expose()
  movieId: string;

  @i18n(IsNumber)
  @i18n(Min, 1)
  @i18n(Max, 50)
  @ct.Expose()
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
export class SeatPositionVo {
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
export class UpdateBookingSeatsRequest {
  @i18n(Length, 1, 36)
  @Expose()
  bookingId: string;

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
  @i18n(IsOptional)
  @Expose()
  seats: CreateBookingSeatsVo[];

  @i18n(IsBoolean)
  @i18n(IsOptional)
  @Expose()
  updateSeats?: boolean;

  @i18n(IsOptional)
  @Expose()
  startingPosition?: SeatPositionVo;
}
