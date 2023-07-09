import { ICalendar, IMatch } from 'core/interfaces';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Expose, Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { IsAfter } from 'core/validators';
import { CalendarRequest } from 'core/requests';
import { MatchType, PlayerCategory } from 'core/enums';

class Calendar implements ICalendar {
  constructor(request: CalendarRequest) {
    this.startDate = request.startDate;
    this.endDate = request.endDate;
    this.tournament = new ObjectId(request.tournament.toString());
    this.prizeMoney = request.prizeMoney;
    this.createdAt = new Date().toISOString();
  }

  @IsString()
  _id: ObjectId;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @IsAfter('startDate')
  endDate: string;

  @IsNotEmpty()
  @IsString()
  tournament: ObjectId | string;

  @ValidateNested({ each: true })
  draw?: Record<MatchType, Record<PlayerCategory, ObjectId[] | IMatch[]>>;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  prizeMoney: number;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt?: string;

  @IsDateString()
  deletedAt?: string;
}

@Entity('calendar')
class CalendarEntity implements ICalendar {
  @ObjectIdColumn()
  @Expose()
  @Transform((params: { obj: { _id: ObjectId } }) => params.obj._id.toString())
  _id: ObjectId;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column()
  @Expose()
  @Transform((params: { obj: { tournament: ObjectId } }) =>
    params.obj.tournament.toString()
  )
  tournament: ObjectId | string;

  @Column({ type: 'json' })
  draw?: Record<MatchType, Record<PlayerCategory, ObjectId[] | IMatch[]>>;

  @Column({ type: 'int', length: 12 })
  prizeMoney: number;

  @CreateDateColumn({ type: 'varchar' })
  createdAt: string;

  @UpdateDateColumn({ type: 'varchar' })
  updatedAt?: string;

  @DeleteDateColumn({ type: 'varchar' })
  deletedAt?: string;
}

export { Calendar, CalendarEntity };
