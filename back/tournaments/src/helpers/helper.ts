import { Tournament } from '../entities/tournamentEntity';
import { TournamentRequest } from 'core/requests';

const updateTournament = (
  tournament: Tournament,
  request: TournamentRequest
): void => {
  tournament.category = request.category;
  tournament.country = request.country;
  tournament.creationYear = request.creationYear;
  tournament.name = request.name;
  tournament.prizeMoney = request.prizeMoney;
  tournament.updatedAt = new Date().toISOString();
};

export { updateTournament };
