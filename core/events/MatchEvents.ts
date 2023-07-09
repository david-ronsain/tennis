import { MatchRound } from '../enums';
import { ICalendar, ITeam, ITournament } from '../interfaces';

interface IAssignPlayerEvent {
  round: MatchRound;

  team: ITeam;

  _id: string;

  number: number;

  tournament: ITournament;

  calendar: ICalendar;
}

export { IAssignPlayerEvent };
