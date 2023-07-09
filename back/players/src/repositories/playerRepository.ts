import datasource from '../../config/datasource';
import { PlayerEntity } from '../entities/playerEntity';

export const PlayerRepository = datasource.then((source) =>
  source.getMongoRepository(PlayerEntity).extend({})
);
