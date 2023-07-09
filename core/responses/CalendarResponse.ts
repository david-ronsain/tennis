import type { ICalendar, ITournament } from "../interfaces";
import { ObjectId } from "mongodb";
import { MatchType, PlayerCategory } from "../enums";

class CalendarResponse implements ICalendar {
  _id: ObjectId | string = undefined as unknown as string;

  startDate: string = undefined as unknown as string;

  endDate: string = undefined as unknown as string;

  tournament: ObjectId | string | ITournament = undefined as unknown as string;

  prizeMoney: number = undefined as unknown as number;

  draw?: Record<MatchType, Record<PlayerCategory, ObjectId[]>> | undefined;
}

export {
    CalendarResponse
}