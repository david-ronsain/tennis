import { ObjectId } from 'mongodb';
import datasource from '../../config/datasource';
import { TournamentEntity } from '../entities/tournamentEntity';
import { TournamentResponse } from 'core/responses';

export const TournamentRepository = datasource.then((source) =>
  source.getMongoRepository(TournamentEntity).extend({
    async getOneWithCalendars(
      id: string
    ): Promise<TournamentResponse | undefined> {
      const cursor = source.getMongoRepository(TournamentEntity).aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $lookup: {
            from: 'calendar',
            localField: '_id',
            foreignField: 'tournament',
            as: 'calendars'
          }
        },
        {
          $project: {
            'calendars.draw': 0,
            'calendars.tournament': 0
          }
        }
      ]);
      return await cursor
        .toArray()
        .then((res: any[]) =>
          res.length
            ? (JSON.parse(JSON.stringify(res[0])) as TournamentResponse)
            : undefined
        );
    }
  })
);
