import { GetPlayersRequest, PlayerRequest } from 'core/requests/PlayerRequest';
import { Player } from '../entities/playerEntity';
import { ObjectId } from 'mongodb';

const updatePlayer = (player: Player, request: PlayerRequest): void => {
  player.proSince = request.proSince;
  player.infos = request.infos;
  player.style = request.style;
  player.updatedAt = new Date().toISOString();
};

/**
 * Prepares the filters for the list and count method
 * @param request
 * @returns
 */
const createFilters = (request: GetPlayersRequest): Record<string, any> => {
  const filters: Record<string, any> = {};
  const excludeFilter = request.exclude.length
    ? request.exclude.split(',').map((id: string) => new ObjectId(id))
    : [];

  if (excludeFilter.length) {
    filters._id = { $nin: excludeFilter };
  }

  if ((request.category ?? '').toString().length) {
    filters['infos.category'] = { $eq: request.category };
  }

  if (request.name.toString().length) {
    filters['infos.lastName'] = {
      $regex: '.*' + request.name + '.*',
      $options: 'i'
    };
  }

  return filters;
};

export { updatePlayer, createFilters };
