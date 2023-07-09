import { ObjectId } from 'mongodb';
import { TournamentCategory, Country, TournamentSurface } from '../enums';
import type { ITournament, ICalendar } from '../interfaces';

class TournamentResponse implements ITournament {
    _id: ObjectId | string = undefined as unknown as string;

    creationYear: number = undefined as unknown as number;

    name: string = undefined as unknown as string;

    category: TournamentCategory = undefined as unknown as TournamentCategory;

    prizeMoney: number = undefined as unknown as number;

    country: Country = undefined as unknown as Country;

    surface: TournamentSurface = undefined as unknown as TournamentSurface;

    calendars?: ICalendar[] = [];
}

export {
    TournamentResponse
}