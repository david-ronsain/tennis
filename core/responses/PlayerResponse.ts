import type { IPlayer, IPlayerInfo, IPlayerStyle } from '../interfaces';
import {
  Country,
  PlayerBackhand,
  PlayerCategory,
  PlayerMainHand
} from '../enums';

class PlayerStyleResponse implements IPlayerStyle {
  mainHand: PlayerMainHand = undefined as unknown as PlayerMainHand;

  backhand: PlayerBackhand = undefined as unknown as PlayerBackhand;
}

class PlayerInfoResponse implements IPlayerInfo {
  firstName: string = undefined as unknown as string;

  lastName: string = undefined as unknown as string;

  picture: string = undefined as unknown as string;

  dateOfBirth: string = undefined as unknown as string;

  country: Country = undefined as unknown as Country;

  category: PlayerCategory = undefined as unknown as PlayerCategory;
}

class PlayerResponse implements IPlayer {
  _id: string = undefined as unknown as string;

  infos: PlayerInfoResponse = undefined as unknown as PlayerInfoResponse;

  style: PlayerStyleResponse = undefined as unknown as PlayerStyleResponse;

  proSince: number = undefined as unknown as number;

  createdAt: string = undefined as unknown as string;

  updatedAt?: string | undefined;

  deletedAt?: string | undefined;
}

export { PlayerResponse, PlayerInfoResponse, PlayerStyleResponse };
