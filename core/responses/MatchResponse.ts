import { MatchRound, MatchState } from '../enums';
import { PlayerResponse } from './PlayerResponse';
import type { IMatch, IScore, ITeam } from '../interfaces';
import { TournamentResponse } from './TournamentResponse';

class TeamResponse implements ITeam {
  player1?: PlayerResponse;

  player2?: PlayerResponse;

  number: number = undefined as unknown as number;

  isWinner?: boolean | undefined;
}

class ScoreResponse implements IScore {
  sets: [number, number][] = [];

  games: [number, number][] = [];

  points: [number, number][] = [];

  history: [number, number][] = [];
}

class MatchResponse implements IMatch {
  _id: string = undefined as unknown as string;

  team1: TeamResponse = undefined as unknown as TeamResponse;

  team2: TeamResponse = undefined as unknown as TeamResponse;

  score?: ScoreResponse;

  startDate?: string;

  endDate?: string;

  round: MatchRound = undefined as unknown as MatchRound;

  number: number = undefined as unknown as number;

  state?: MatchState;

  calendar: string = undefined as unknown as string;

  tournament?: TournamentResponse;
}

export { MatchResponse, ScoreResponse, TeamResponse };
