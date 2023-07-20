import { Service } from 'typedi';
import { validateSync } from 'class-validator';
import { TournamentRepository } from '../repositories/tournamentRepository';
import { HttpError } from 'routing-controllers';
import { ObjectId } from 'mongodb';
import { prepareFilters, updateTournament } from '../helpers/helper';
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
    const filters = prepareFilters(request);

    return (await TournamentRepository).find({
      where: filters.$and.length ? filters : {},
      skip:
        parseInt((request.skip ?? 0).toString()) *
        parseInt((request.results ?? 0).toString()),
      take: parseInt((request.results ?? 0).toString())
    });
  }

  /**
   * Returns the number of players
   * @param request Request filters
   * @returns
   */
  async count(request: GetTournamentsRequest): Promise<number> {
    const filters = prepareFilters(request);

    return (await TournamentRepository).count(
      filters.$and.length ? filters : {}
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
