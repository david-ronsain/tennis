import { MatchState } from '../enums/MatchState';
import { MatchRound } from '../enums/MatchRound';
import { ObjectId } from 'mongodb';
import { PlayerResponse } from '../responses/PlayerResponse';

interface IMatch {
  _id?: ObjectId | string;

  team1: ITeam;

  team2: ITeam;

  score?: IScore;

  startDate?: string;

  endDate?: string;

  round: MatchRound;

  number: number;

  state?: MatchState;

  calendar: ObjectId | string;
}

interface ITeam {
  number?: number;

  player1?: ObjectId | PlayerResponse | string;

  player2?: ObjectId | PlayerResponse | string;

  isWinner?: boolean;
}

interface IScore {
  sets: [number, number][];

  games: [number, number][];

  points: [number, number][];

  history: [number, number][];
}

export type { IMatch, ITeam, IScore };
