import { PlayerRequest } from 'core/requests/PlayerRequest';
import { Player } from '../entities/playerEntity';

const updatePlayer = (player: Player, request: PlayerRequest): void => {
  player.proSince = request.proSince;
  player.infos = request.infos;
  player.style = request.style;
  player.updatedAt = new Date().toISOString();
};

export { updatePlayer };
