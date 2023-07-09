import { Service } from 'typedi';
import { validateSync } from 'class-validator';
import { TournamentRepository } from '../repositories/tournamentRepository';
import { HttpError } from 'routing-controllers';
import { ObjectId } from 'mongodb';
import { updateTournament } from '../helpers/helper';
import { Tournament } from '../entities/tournamentEntity';
import { InvalidRequestError } from 'core/errors';
import { GetTournamentsRequest, TournamentRequest } from 'core/requests';
import { TournamentResponse } from 'core/responses';

@Service()
export class TournamentService {
  /**
   * Returns the list of all tournaments, paginated
   * @param request Request filters
   * @returns
   */
  async list(request: GetTournamentsRequest): Promise<Tournament[]> {
    const filters: { name?: any; surface?: any; category?: any } = {};

    if (request.name.length) {
      filters.name = { $regex: '.*' + request.name + '.*', $options: 'i' };
    }

    if (request.category) {
      filters.category = { $eq: request.category };
    }

    if (request.surface) {
      filters.surface = { $eq: request.surface };
    }

    return (await TournamentRepository).find({
      where: filters,
      skip:
        parseInt(request.skip.toString()) *
        parseInt(request.results.toString()),
      take: parseInt(request.results.toString())
    });
  }

  /**
   * Returns the number of players
   * @param request Request filters
   * @returns
   */
  async count(request: GetTournamentsRequest): Promise<number> {
    const filters: Record<string, any> = {};

    if (request.name.length) {
      filters.name = { $regex: '.*' + request.name + '.*', $options: 'i' };
    }

    if (request.category) {
      filters.category = { $eq: request.category };
    }

    if (request.surface) {
      filters.surface = { $eq: request.surface };
    }

    return (await TournamentRepository).count(
      Object.keys(filters).length ? filters : {}
    );
  }

  /**
   * Find a tournament by its id
   * @param id ID of the tournament
   * @throws HttpError
   * @returns
   */
  async getById(id: string): Promise<TournamentResponse> {
    const tournament = await (
      await TournamentRepository
    ).getOneWithCalendars(id);
    if (!tournament) {
      throw new HttpError(404, 'tournament not found');
    }

    return tournament;
  }

  /**
   * Creates a new tournament
   * @param tournamentRequest the informations about the tournament to create
   * @throws InvalidRequestError
   * @throws HttpError
   * @returns
   */
  async create(tournamentRequest: TournamentRequest): Promise<Tournament> {
    const errors = validateSync(tournamentRequest);
    if (errors.length) {
      throw new InvalidRequestError(errors);
    }

    const tournament = new Tournament(tournamentRequest);
    return (await TournamentRepository)
      .insertOne(tournament)
      .then(() => tournament)
      .catch((err: string | undefined) => {
        throw new HttpError(400, err);
      });
  }

  /**
   * Updates an existing tournament
   * @param id The id of the tournament to update
   * @param tournamentRequest the informations about the tournament to update
   * @throws InvalidRequestError
   * @throws HttpError
   * @returns
   */
  async update(
    id: string,
    tournamentRequest: TournamentRequest
  ): Promise<Tournament> {
    const errors = validateSync(tournamentRequest);
    if (errors.length) {
      throw new InvalidRequestError(errors);
    }

    const tournament = await (
      await TournamentRepository
    ).findOne({
      where: {
        _id: new ObjectId(id.toString())
      }
    });

    if (!tournament) {
      throw new HttpError(404, 'tournament not found');
    }

    updateTournament(tournament, tournamentRequest);

    return (await TournamentRepository)
      .update(id.toString(), tournament)
      .then(() => tournament)
      .catch(() => {
        throw new HttpError(400, 'not updated');
      });
  }
}
