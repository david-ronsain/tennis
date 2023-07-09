import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator';
import { IMatch, IScore, ITeam } from '../interfaces/IMatch';
import { ObjectId } from 'mongodb';
import { MatchType, PlayerCategory, MatchState, MatchRound } from '../enums';

class TeamRequest implements ITeam {
  @IsOptional()
  @IsString()
  player1?: string | ObjectId;

  @IsOptional()
  @IsString()
  player2?: string | ObjectId;

  @IsNotEmpty()
  @IsNumber()
  number: number;

  @IsOptional()
  @IsBoolean()
  isWinner?: boolean | undefined;
}

class ScoreRequest implements IScore {
  @IsOptional()
  sets: [number, number][];

  @IsOptional()
  games: [number, number][];

  @IsOptional()
  points: [number, number][];

  @IsOptional()
  history: [number, number][];
}

class MatchRequest implements IMatch {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested({})
  team1: TeamRequest;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  team2: TeamRequest;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  score?: ScoreRequest;

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

class ListMatchesRequest {
  @IsOptional()
  @IsEnum(MatchState)
  state: MatchState;

  @IsOptional()
  @IsString()
  calendar: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  skip = 0;

  @IsOptional()
  @IsNumber()
  @Min(1)
  results = 10;

  @IsOptional()
  @IsString()
  name = '';

  @IsOptional()
  @IsString()
  startDate = '';

  @IsOptional()
  @IsString()
  endDate = '';

  @IsOptional()
  @IsString()
  tournament = '';

  @IsOptional()
  @IsEnum(PlayerCategory)
  category: PlayerCategory;
}

export { MatchRequest, TeamRequest, ScoreRequest, ListMatchesRequest };
