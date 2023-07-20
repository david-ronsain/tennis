import { ObjectId } from 'mongodb';
import datasource from '../../config/datasource';
import { MatchEntity } from '../entities/MatchEntity';
import { MatchResponse } from 'core/responses';

export const MatchRepository = datasource.then((source) =>
  source.getMongoRepository(MatchEntity).extend({
    async getList(
      filters: Record<string, any>,
      skip: number,
      limit: number
    ): Promise<MatchResponse[]> {
      const cursor = source.getMongoRepository(MatchEntity).aggregate([
        {
          $lookup: {
            from: 'players',
            localField: 'team1.player1',
            foreignField: '_id',
            as: 'team1.player1'
          }
        },
        {
          $unwind: {
            path: '$team1.player1',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team1.player2',
            foreignField: '_id',
            as: 'team1.player2'
          }
        },
        {
          $unwind: {
            path: '$team1.player2',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team2.player1',
            foreignField: '_id',
            as: 'team2.player1'
          }
        },
        {
          $unwind: {
            path: '$team2.player1',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team2.player2',
            foreignField: '_id',
            as: 'team2.player2'
          }
        },
        {
          $unwind: {
            path: '$team2.player2',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'calendar',
            localField: 'calendar',
            foreignField: '_id',
            as: 'calendar'
          }
        },
        {
          $unwind: {
            path: '$calendar',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'tournaments',
            localField: 'calendar.tournament',
            foreignField: '_id',
            as: 'tournament'
          }
        },
        {
          $unwind: {
            path: '$tournament',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: filters
        },
        {
          $project: {
            calendar: '$calendar._id',
            startDate: 1,
            endDate: 1,
            number: 1,
            round: 1,
            score: 1,
            state: 1,
            team1: 1,
            team2: 1,
            tournament: 1,
            _id: 1
          }
        },
        { $skip: skip },
        { $limit: limit }
      ]);

      return await cursor
        .toArray()
        .then(
          (matches: MatchEntity[]) =>
            matches.map((m: MatchEntity) =>
              Object.assign({}, m)
            ) as MatchResponse[]
        );
    },

    async count(filters: Record<string, any>): Promise<number> {
      const cursor = source.getMongoRepository(MatchEntity).aggregate([
        {
          $lookup: {
            from: 'players',
            localField: 'team1.player1',
            foreignField: '_id',
            as: 'team1.player1'
          }
        },
        {
          $unwind: {
            path: '$team1.player1',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team1.player2',
            foreignField: '_id',
            as: 'team1.player2'
          }
        },
        {
          $unwind: {
            path: '$team1.player2',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team2.player1',
            foreignField: '_id',
            as: 'team2.player1'
          }
        },
        {
          $unwind: {
            path: '$team2.player1',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team2.player2',
            foreignField: '_id',
            as: 'team2.player2'
          }
        },
        {
          $unwind: {
            path: '$team2.player2',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'calendar',
            localField: 'calendar',
            foreignField: '_id',
            as: 'calendar'
          }
        },
        {
          $unwind: {
            path: '$calendar',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'tournaments',
            localField: 'calendar.tournament',
            foreignField: '_id',
            as: 'tournament'
          }
        },
        {
          $unwind: {
            path: '$tournament',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: filters
        },
        {
          $count: 'total'
        }
      ]);

      return await cursor
        .toArray()
        .then((res: any[]) => (res.length ? (res[0].total as number) : 0));
    },

    async getOneBy(_id: string): Promise<MatchEntity | undefined> {
      const cursor = source.getMongoRepository(MatchEntity).aggregate([
        {
          $match: {
            _id: new ObjectId(_id)
          }
        }
      ]);
      return await cursor
        .toArray()
        .then((res: any[]) =>
          res.length ? (res[0] as MatchEntity) : undefined
        );
    },

    async getOneWithTeams(_id: string): Promise<MatchResponse | undefined> {
      const cursor = source.getMongoRepository(MatchEntity).aggregate([
        {
          $match: {
            _id: new ObjectId(_id)
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team1.player1',
            foreignField: '_id',
            as: 'team1.player1'
          }
        },
        {
          $unwind: {
            path: '$team1.player1',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team1.player2',
            foreignField: '_id',
            as: 'team1.player2'
          }
        },
        {
          $unwind: {
            path: '$team1.player2',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team2.player1',
            foreignField: '_id',
            as: 'team2.player1'
          }
        },
        {
          $unwind: {
            path: '$team2.player1',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: 'team2.player2',
            foreignField: '_id',
            as: 'team2.player2'
          }
        },
        {
          $unwind: {
            path: '$team2.player2',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'calendar',
            localField: 'calendar',
            foreignField: '_id',
            as: 'calendar'
          }
        },
        {
          $unwind: {
            path: '$calendar',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'tournaments',
            localField: 'calendar.tournament',
            foreignField: '_id',
            as: 'tournament'
          }
        },
        {
          $unwind: {
            path: '$tournament',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            calendar: 0
          }
        },
        { $limit: 1 }
      ]);

      return await cursor.toArray().then((matches: MatchEntity[]) => {
        if (matches.length) {
          const m = matches.map((m: MatchEntity) =>
            Object.assign({}, m)
          ) as MatchResponse[];
          return m.length ? m[0] : undefined;
        }
        return undefined;
      });
    }
  })
);
