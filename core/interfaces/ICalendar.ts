import { PlayerCategory } from '../enums/PlayerCategory';
import { ObjectId } from 'mongodb';
import { MatchType } from '../enums/MatchType';
import type { IMatch, ITournament } from './';

interface ICalendar {
  _id: ObjectId | string;

  startDate: string;

  endDate: string;

  prizeMoney: number;

  tournament: ObjectId | string | ITournament;

  draw?: Record<MatchType, Record<PlayerCategory, ObjectId[] | IMatch[]>>;
}

export type { ICalendar };
