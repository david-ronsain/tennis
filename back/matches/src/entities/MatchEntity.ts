import { ITeam, IScore, IMatch } from 'core/interfaces/IMatch';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ObjectIdColumn,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString
} from 'class-validator';
import { MatchRound, MatchState } from 'core/enums';
import { MatchRequest } from 'core/requests';
import { PlayerResponse } from 'core/responses';

class Team implements ITeam {
  constructor(
    number: number,
    player1?: string | PlayerResponse | ObjectId,
    player2?: string | PlayerResponse | ObjectId
  ) {
    this.number = number;
    if (typeof player1 === 'string') {
      this.player1 = player1;
    } else if (player1 instanceof ObjectId) {
      this.player1 = player1.toString();
    }
    if (typeof player2 === 'string') {
      this.player2 = player2;
    } else if (player2 instanceof ObjectId) {
      this.player2 = player2.toString();
    }
  }
  @Column({ type: 'number', width: 1 })
  number: number;

  @Expose()
  @Transform(
    (params: { obj: { player1?: ObjectId } }) =>
      params.obj?.player1?.toString() ?? ''
  )
  @ObjectIdColumn()
  player1?: ObjectId | string;

  @Expose()
  @Transform(
    (params: { obj: { player2?: ObjectId } }) =>
      params.obj?.player2?.toString() ?? ''
  )
  @ObjectIdColumn()
  player2?: ObjectId | string;

  isWinner?: boolean;
}

class Score implements IScore {
  constructor() {
    this.sets = [];
    this.games = [];
    this.points = [];
    this.history = [];
  }
  @Column({ type: 'json' })
  sets: [number, number][];

  @Column({ type: 'json' })
  games: [number, number][];

  @Column({ type: 'json' })
  points: [number, number][];

  @Column({ type: 'json' })
  history: [number, number][];
}

class Match implements IMatch {
  constructor(request: MatchRequest) {
    this.team1 = request.team1 as Team;
    if (typeof this.team1?.player1 === 'string') {
      this.team1.player1 = new ObjectId(this.team1.player1);
    }
    if (typeof this.team1?.player2 === 'string') {
      this.team1.player2 = new ObjectId(this.team1.player2);
    }
    this.team2 = request.team2 as Team;
    if (typeof this.team2?.player1 === 'string') {
      this.team2.player1 = new ObjectId(this.team2.player1);
    }
    if (typeof this.team2?.player2 === 'string') {
      this.team2.player2 = new ObjectId(this.team2.player2);
    }
    this.score = request.score;
    this.startDate = request.startDate;
    this.endDate = request.endDate;
    this.round = request.round;
    this.number = request.number;
    this.calendar = request.calendar;
    this.state = MatchState.NOT_BEGUN;
    if (typeof this.calendar === 'string') {
      this.calendar = new ObjectId(this.calendar);
    }
  }

  @Expose()
  @Transform((params: { obj: { _id: ObjectId } }) => params.obj._id.toString())
  _id?: ObjectId;

  @IsNotEmpty()
  @IsObject()
  @Type(() => Team)
  team1: Team;

  @IsNotEmpty()
  @IsObject()
  @Type(() => Team)
  team2: Team;

  @IsNotEmpty()
  @IsObject()
  @Type(() => Score)
  score?: Score;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsNotEmpty()
  @IsEnum(MatchRound)
  round: MatchRound;

  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsOptional()
  @IsEnum(MatchState)
  state?: MatchState;

  @IsNotEmpty()
  @IsString()
  calendar: string | ObjectId;
}

@Entity('matches')
class MatchEntity implements IMatch {
  @PrimaryColumn()
  @ObjectIdColumn()
  @Expose()
  @Transform((params: { obj: { _id: ObjectId } }) => params.obj._id.toString())
  _id: ObjectId | string;

  @Column(() => Team)
  team1: Team;

  @Column(() => Team)
  team2: Team;

  @Column(() => Score)
  score?: Score;

  @Column({ type: 'datetime' })
  startDate?: string;

  @Column({ type: 'datetime' })
  endDate?: string;

  @Column({ type: 'enum', enum: MatchRound })
  round: MatchRound;

  @Column({ type: 'int', width: 3 })
  number: number;

  @Column({ type: 'enum', enum: MatchState, default: MatchState.NOT_BEGUN })
  state: MatchState;

  @Column()
  calendar: ObjectId | string;

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

export { Match, MatchEntity, Team, Score };
