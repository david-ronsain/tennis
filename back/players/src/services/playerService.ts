import { Service } from 'typedi';
import {
  PlayerInfoRequest,
  PlayerRequest,
  PlayerStyleRequest
} from 'core/requests';
import { validateSync } from 'class-validator';
import { PlayerRepository } from '../repositories/playerRepository';
import { HttpError } from 'routing-controllers';
import { ObjectId } from 'mongodb';
import { updatePlayer, createFilters } from '../helpers/helper';
import { plainToInstance } from 'class-transformer';
import { Player } from '../entities/playerEntity';
import { InvalidRequestError } from 'core/errors';
import { GetPlayersRequest } from 'core/requests/PlayerRequest';

@Service()
export class PlayerService {
  /**
   * Returns the list of all players, paginated
   * @param request Informations about the players to list
   * @returns
   */
  async list(request: GetPlayersRequest): Promise<Player[]> {
    const filters = createFilters(request);

    const query = {
      ...(Object.values(filters).length ? { where: filters } : []),
      skip:
        parseInt(request.skip.toString()) *
        parseInt(request.results.toString()),
      take: parseInt(request.results.toString())
    };

    return (await PlayerRepository).find(query);
  }

  /**
   * Returns the number of players
   * @param request Informations about the players to count
   * @returns
   */
  async count(request: GetPlayersRequest): Promise<number> {
    const filters = createFilters(request);

    return (await PlayerRepository).count(
      Object.keys(filters).length ? filters : {}
    );
  }

  /**
   * Returns a player by its id
   * @param id Player ID
   * @throws HttpError
   * @returns
   */
  async getById(id: string): Promise<Player> {
    const player = await (
      await PlayerRepository
    ).findOneBy({ _id: new ObjectId(id) });
    if (!player) {
      throw new HttpError(404, 'player not found');
    }

    return player;
  }

  /**
   * Creates a new player
   * @param playerRequest the informations about the player to create
   * @throws InvalidRequestError
   * @throws HttpError
   * @returns
   */
  async create(playerRequest: PlayerRequest): Promise<Player> {
    const errors = [
      ...validateSync(playerRequest),
      ...(playerRequest.infos ? validateSync(playerRequest.infos) : []),
      ...(playerRequest.style ? validateSync(playerRequest.style) : [])
    ];

    if (errors.length) {
      throw new InvalidRequestError(errors);
    }

    const player = new Player(playerRequest);
    return (await PlayerRepository)
      .insertOne(player)
      .then(() => player)
      .catch((err: string | undefined) => {
        throw new HttpError(400, err);
      });
  }

  /**
   * Updates an existing user
   * @param id The id of the user to update
   * @param playerRequest the informations about the player to update
   * @throws InvalidRequestError
   * @throws HttpError
   * @returns
   */
  async update(id: string, playerRequest: PlayerRequest): Promise<Player> {
    const errors = [
      ...validateSync(playerRequest),
      ...validateSync(plainToInstance(PlayerInfoRequest, playerRequest.infos)),
      ...validateSync(plainToInstance(PlayerStyleRequest, playerRequest.style))
    ];
    if (errors.length) {
      throw new InvalidRequestError(errors);
    }

    const player = await (
      await PlayerRepository
    ).findOne({
      where: {
        _id: new ObjectId(id.toString())
      }
    });

    if (!player) {
      throw new HttpError(404, 'player not found');
    }

    updatePlayer(player, playerRequest);

    return (await PlayerRepository)
      .update(id.toString(), player)
      .then(() => player)
      .catch(() => {
        throw new HttpError(400, 'not updated');
      });
  }
}
