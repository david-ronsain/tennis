import { ObjectId } from 'mongodb';
import { TournamentCategory } from '../enums/TournamentCategory';
import { Country } from '../enums/Country';
import { TournamentSurface } from '../enums/TournamentSurface';

interface ITournament {
  _id: ObjectId | string;

  creationYear: number;

  name: string;

  category: TournamentCategory;

  prizeMoney: number;

  country: Country;

  surface: TournamentSurface;
}

export { type ITournament };
