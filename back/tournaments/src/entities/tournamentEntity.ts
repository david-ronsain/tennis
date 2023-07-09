import { ITournament } from 'core/interfaces';
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
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength
} from 'class-validator';
import { TournamentRequest } from 'core/requests';
import { TournamentCategory, TournamentSurface, Country } from 'core/enums';

class Tournament implements ITournament {
  constructor(tournamentRequest: TournamentRequest) {
    this.creationYear = tournamentRequest.creationYear;
    this.name = tournamentRequest.name;
    this.category = tournamentRequest.category;
    this.prizeMoney = tournamentRequest.prizeMoney;
    this.country = tournamentRequest.country;
    this.surface = tournamentRequest.surface;
    this.createdAt = new Date().toISOString();
  }

  @IsString()
  _id: ObjectId;

  @IsNotEmpty()
  @IsNumber()
  @Min(1850)
  @Max(2022)
  creationYear: number;

  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(TournamentCategory)
  category: TournamentCategory;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  prizeMoney: number;

  @IsEnum(Country)
  country: Country;

  @IsEnum(TournamentSurface)
  surface: TournamentSurface;

  @IsDateString()
  createdAt?: string;

  @IsDateString()
  updatedAt?: string;

  @IsDateString()
  deletedAt?: string;
}

@Entity('tournaments')
class TournamentEntity implements ITournament {
  @ObjectIdColumn()
  @Expose()
  @Transform((params: { obj: { _id: ObjectId } }) => params.obj._id.toString())
  _id: ObjectId;

  @Column({ type: 'int', length: 4 })
  creationYear: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int', length: 1 })
  @IsEnum(TournamentCategory)
  category: TournamentCategory;

  @Column({ type: 'int', length: 12 })
  prizeMoney: number;

  @Column({ type: 'varchar', length: 4 })
  @IsEnum(Country)
  country: Country;

  @Column({ type: 'int', length: 1 })
  @IsEnum(TournamentSurface)
  surface: TournamentSurface;

  @CreateDateColumn({ update: false, type: 'varchar', select: false })
  createdAt: string = new Date().toISOString();

  @UpdateDateColumn({ insert: false, type: 'varchar', select: false })
  updatedAt?: string;

  @DeleteDateColumn({
    insert: false,
    type: 'varchar',
    select: false,
    update: false
  })
  deletedAt?: string;
}

export { Tournament, TournamentEntity };
