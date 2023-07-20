import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { IsAfter } from '../validators/IsAfter';

export class CalendarRequest {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @IsAfter('startDate')
  endDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  prizeMoney: number;

  @IsNotEmpty()
  @IsString()
  tournament: ObjectId;
}

export class GetCalendarRequest {
  skip? = 0;

  results? = 10;

  name? = '';

  tournament? = '';

  startDate? = '';

  endDate? = '';

  exclude? = '';
}
