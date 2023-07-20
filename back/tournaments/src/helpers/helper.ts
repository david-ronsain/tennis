import { Tournament } from '../entities/tournamentEntity';
import { GetTournamentsRequest, TournamentRequest } from 'core/requests';

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
  tournament.surface = request.surface;
};

const prepareFilters = (request: GetTournamentsRequest): { $and: any[] } => {
  const filters: { $and: any[] } = { $and: [] };

  if (request.name?.length) {
    filters.$and.push({
      name: { $regex: '.*' + request.name + '.*', $options: 'i' }
    });
  }

  if (request.category?.length) {
    filters.$and.push({ category: { $eq: request.category } });
  }

  if (request.surface?.length) {
    filters.$and.push({ surface: { $eq: request.surface } });
  }

  return filters;
};

export { updateTournament, prepareFilters };
