import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min
} from 'class-validator';
import { Country } from '../enums/Country';
import { TournamentCategory } from '../enums/TournamentCategory';
import { TournamentSurface } from '../enums/TournamentSurface';

class TournamentRequest {
  @IsNotEmpty()
  @IsNumber()
  @Min(1850)
  @Max(2022)
  creationYear: number;

  @IsString()
  @Length(2, 100)
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
}

class GetTournamentsRequest {
  skip? = 0;

  results? = 10;

  name? = '';

  category? = undefined as unknown as TournamentCategory;

  surface? = undefined as unknown as TournamentSurface;
}

export { TournamentRequest, GetTournamentsRequest };
