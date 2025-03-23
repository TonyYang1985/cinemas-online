import { i18n } from '@footy/fmk/libs/validator';
import { Expose } from 'class-transformer';
import { IsNumber, IsString, Length, Max, Min } from 'class-validator';

@Expose()
export class CreateMoviesRequest {
  @i18n(IsString)
  @i18n(Length, 1, 255)
  @Expose()
  title: string;

  @i18n(IsNumber)
  @i18n(Min, 1)
  @i18n(Max, 26)
  @Expose()
  totalRows: number;

  @i18n(IsNumber)
  @i18n(Min, 1)
  @i18n(Max, 50)
  @Expose()
  seatsPerRow: number;
}

export class UpdateMoviesRequest {
  @i18n(Length, 1, 255)
  @Expose()
  title: string;

  @i18n(IsNumber)
  @i18n(Min, 1)
  @i18n(Max, 26)
  @Expose()
  totalRows: number;

  @i18n(IsNumber)
  @i18n(Min, 1)
  @i18n(Max, 50)
  @Expose()
  seatsPerRow: number;
}
