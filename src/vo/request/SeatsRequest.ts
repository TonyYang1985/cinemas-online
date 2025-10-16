import { i18n } from '@gaias/basenode';
import { Expose } from 'class-transformer';
import { IsNumber, IsString, Length, Matches, Max, Min } from 'class-validator';

@Expose()
export class CreateSeatsRequest {
  @i18n(IsString)
  @i18n(Length, 1, 36)
  @Expose()
  bookingId: string;

  @i18n(IsString)
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

export class UpdateSeatsRequest {
  @i18n(IsString)
  @i18n(Length, 1, 36)
  @Expose()
  bookingId: string;

  @i18n(IsString)
  @i18n(Length, 1, 1)
  @i18n(Matches, /^[A-Za-z]$/)
  @Expose()
  rowLetter: string;

  @Expose()
  seatNumber: number;
}
