import { i18n } from '@footy/fmk/libs/validator';
import { Expose } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

@Expose()
export class CreateMoviesRequest {
  @i18n(IsString)
  @i18n(Length, 1, 255)
  @Expose()
  title: string;

  @i18n(Min, 1)
  @i18n(Max, 26)
  @i18n(IsInt)
  @Expose()
  totalRows: number;

  @i18n(IsInt)
  @i18n(Min, 1)
  @i18n(Max, 50)
  @Expose()
  seatsPerRow: number;

  @i18n(IsIn, ['asc', 'desc'])
  @i18n(IsOptional)
  @i18n(IsString)
  @Expose()
  sort: string = 'desc';
}

export class UpdateMoviesRequest {
  @i18n(Length, 1, 255)
  @Expose()
  title: string;

  @i18n(Min, 1)
  @i18n(Max, 26)
  @i18n(IsNumber)
  @Expose()
  totalRows: number;

  @i18n(Min, 1)
  @i18n(Max, 50)
  @i18n(IsNumber)
  @Expose()
  seatsPerRow: number;
}
