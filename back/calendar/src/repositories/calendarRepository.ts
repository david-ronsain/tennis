import { ObjectId } from 'mongodb';
import datasource from '../../config/datasource';
import { CalendarEntity } from '../entities/calendarEntity';
import { MatchType, PlayerCategory } from 'core/enums';
import { IMatch } from 'core/interfaces';
import { CalendarResponse } from 'core/responses';

export const CalendarRepository = datasource.then((source) =>
  source.getMongoRepository(CalendarEntity).extend({
    async getList(
      filters: Record<string, any>,
      skip: number,
      limit: number
    ): Promise<CalendarResponse[]> {
      const cursor = source.getMongoRepository(CalendarEntity).aggregate([
        {
          $lookup: {
            from: 'tournaments',
            localField: 'tournament',
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
        { $match: filters },
        { $skip: Number(skip) },
        { $limit: Number(limit) }
      ]);

      return await cursor
        .toArray()
        .then((res: any[]) =>
          res.length
            ? (JSON.parse(JSON.stringify(res)) as CalendarResponse[])
            : []
        );
    },
    async count(filters: Record<string, any>): Promise<number> {
      const cursor = source.getMongoRepository(CalendarEntity).aggregate([
        {
          $lookup: {
            from: 'tournaments',
            localField: 'tournament',
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
        { $match: filters },
        {
          $count: 'total'
        }
      ]);

      return await cursor
        .toArray()
        .then((res: any[]) => (res.length ? (res[0].total as number) : 0));
    },
    findOneBy(where: any): Promise<CalendarEntity | null> {
      return source
        .getMongoRepository(CalendarEntity)
        .findOneBy(where)
        .then((cal: CalendarEntity | null) => {
          if (cal) {
            cal.tournament = cal.tournament.toString();
          }
          return cal;
        });
    },
    async getDraw(
      id: string
    ): Promise<
      Record<MatchType, Record<PlayerCategory, IMatch[]>> | undefined
    > {
      const cursor = source.getMongoRepository(CalendarEntity).aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $lookup: {
            from: 'matches',
            localField: 'draw.SINGLES.ATP',
            foreignField: '_id',
            as: 'draw.SINGLES.ATP',
            pipeline: [
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
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'matches',
            localField: 'draw.SINGLES.WTA',
            foreignField: '_id',
            as: 'draw.SINGLES.WTA',
            pipeline: [
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
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'matches',
            localField: 'draw.DOUBLES.ATP',
            foreignField: '_id',
            as: 'draw.DOUBLES.ATP',
            pipeline: [
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
              }
            ]
          }
        },
        {
          $lookup: {
            from: 'matches',
            localField: 'draw.DOUBLES.WTA',
            foreignField: '_id',
            as: 'draw.DOUBLES.WTA',
            pipeline: [
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
              }
            ]
          }
        }
      ]);

      return await cursor
        .toArray()
        .then((calendar: CalendarEntity[]) =>
          calendar.length
            ? (JSON.parse(JSON.stringify(calendar[0].draw)) as Record<
                MatchType,
                Record<PlayerCategory, IMatch[]>
              >)
            : undefined
        );
    }
  })
);
