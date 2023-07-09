import { PlayerMainHand } from '../enums/PlayerMainHand';
import { PlayerBackhand } from '../enums/PlayerBackhand';
import { ObjectId } from 'mongodb';
import { Country } from '../enums/Country';
import { PlayerCategory } from '../enums/PlayerCategory';

interface IPlayer {
  _id: ObjectId | string;

  infos: IPlayerInfo;

  style: IPlayerStyle;

  proSince?: number;

  createdAt: string;

  updatedAt?: string;

  deletedAt?: string;
}

interface IPlayerInfo {
  firstName: string;

  lastName: string;

  dateOfBirth: string;

  country: Country;

  picture: string;

  category: PlayerCategory;
}

interface IPlayerStyle {
  mainHand: PlayerMainHand;

  backhand: PlayerBackhand;
}

export { 
  type IPlayer, 
  type IPlayerInfo, 
  type IPlayerStyle
 };
