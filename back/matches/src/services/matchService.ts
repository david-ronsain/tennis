import { Service } from 'typedi';
import { validateSync } from 'class-validator';
import { MatchRepository } from '../repositories/matchRepository';
import { HttpError } from 'routing-controllers';
import { ObjectId } from 'mongodb';
import { scorePoint, updateMatch } from '../helpers/helper';
import { Match, Team } from '../entities/MatchEntity';
import { InvalidRequestError } from 'core/errors';
import { MatchRequest } from 'core/requests';
import axios from 'axios';
import { config } from 'core/config/config';
import { ICalendar, IPlayer, ITeam, ITournament } from 'core/interfaces';
import { ListMatchesRequest } from 'core/requests/MatchRequest';
import { MatchResponse } from 'core/responses';
import { io } from 'socket.io-client';

@Service()
export class MatchService {
  async list(request: ListMatchesRequest): Promise<MatchResponse[]> {
    const errors = validateSync(request);
    if (errors.length) {
      throw new InvalidRequestError(errors);
    }

    const filters: { $and: any[] } = { $and: [] };

    if (request.state) {
      filters['$and'].push({ state: { $eq: request.state } });
    }

    if (request.calendar && request.calendar.length) {
      filters['$and'].push({ calendar: { $eq: request.calendar } });
    }

    if (request.startDate?.length) {
      filters['$and'].push({ startDate: { $gte: request.startDate } });
    }

    if (request.endDate?.length) {
      filters['$and'].push({ startDate: { $gte: request.endDate } });
    }

    if (request.tournament?.length) {
      filters['$and'].push({
        'tournament._id': new ObjectId(request.tournament.toString())
      });
    }

    if (request.name.length) {
      filters['$and'].push({
        $or: [
          {
            'team1.player1.infos.lastName': {
              $regex: '.*' + request.name + '.*',
              $options: 'i'
            }
          },
          {
            'team1.player2.infos.lastName': {
              $regex: '.*' + request.name + '.*',
              $options: 'i'
            }
          },
          {
            'team2.player1.infos.lastName': {
              $regex: '.*' + request.name + '.*',
              $options: 'i'
            }
          },
          {
            'team2.player2.infos.lastName': {
              $regex: '.*' + request.name + '.*',
              $options: 'i'
            }
          }
        ]
      });
    }

    if (request.category) {
      filters['$and'].push({
        $or: [
          {
            'team1.player1.infos.category': { $eq: request.category as string }
          },
          {
            'team2.player1.infos.category': { $eq: request.category as string }
          }
        ]
      });
    }

    return await (
      await MatchRepository
    ).getList(
      filters['$and'].length ? filters : {},
      parseInt(request.skip.toString()) * parseInt(request.results.toString()),
      parseInt(request.results.toString())
    );
  }

  async count(request: ListMatchesRequest): Promise<number> {
    const errors = validateSync(request);
    if (errors.length) {
      throw new InvalidRequestError(errors);
    }

    const filters: { $and: any[] } = { $and: [] };

    if (request.state) {
      filters['$and'].push({ state: { $eq: request.state } });
    }

    if (request.calendar && request.calendar.length) {
      filters['$and'].push({ calendar: { $eq: request.calendar } });
    }

    if (request.startDate?.length) {
      filters['$and'].push({ startDate: { $gte: request.startDate } });
    }

    if (request.endDate?.length) {
      filters['$and'].push({ startDate: { $gte: request.endDate } });
    }

    if (request.tournament?.length) {
      filters['$and'].push({
        'tournament._id': new ObjectId(request.tournament.toString())
      });
    }

    if (request.name.length) {
      filters['$and'].push({
        $or: [
          {
            'team1.player1.infos.lastName': {
              $regex: '.*' + request.name + '.*',
              $options: 'i'
            }
          },
          {
            'team1.player2.infos.lastName': {
              $regex: '.*' + request.name + '.*',
              $options: 'i'
            }
          },
          {
            'team2.player1.infos.lastName': {
              $regex: '.*' + request.name + '.*',
              $options: 'i'
            }
          },
          {
            'team2.player2.infos.lastName': {
              $regex: '.*' + request.name + '.*',
              $options: 'i'
            }
          }
        ]
      });
    }

    if (request.category) {
      filters['$and'].push({
        $or: [
          {
            'team1.player1.infos.category': { $eq: request.category as string }
          },
          {
            'team2.player1.infos.category': { $eq: request.category as string }
          }
        ]
      });
    }

    return (await MatchRepository).count(filters['$and'].length ? filters : {});
  }

  /**
   * Creates a new match
   * @param request the informations about the match
   * @throws InvalidRequestError
   * @throws HttpError
   * @returns
   */
  async create(request: MatchRequest): Promise<Match> {
    const errors = validateSync(request);
    if (errors.length) {
      throw new InvalidRequestError(errors);
    }
    const match = new Match(request);
    return (await MatchRepository)
      .insertOne(match)
      .then(() => match)
      .catch((err: string | undefined) => {
        throw new HttpError(400, err);
      });
  }

  /**
   * Updates an existing match
   * @param id The id of the match to update
   * @param request the informations about the match to update
   * @throws InvalidRequestError
   * @throws HttpError
   * @returns
   */
  async update(id: string, request: MatchRequest): Promise<Match> {
    const errors = validateSync(request);
    if (errors.length) {
      throw new InvalidRequestError(errors);
    }

    const match = await (
      await MatchRepository
    ).findOne({
      where: {
        _id: new ObjectId(id.toString())
      }
    });

    if (!match) {
      throw new HttpError(404, 'match not found');
    }

    updateMatch(match, request);

    return (await MatchRepository)
      .update(id.toString(), match)
      .then(() => JSON.parse(JSON.stringify(match)) as Match)
      .catch(() => {
        throw new HttpError(400, 'not updated');
      });
  }

  /**
   * Score a point for a team
   * @param matchId match ID
   * @param playerId ID of the player who scored the point
   * @returns
   */
  async updateScore(matchId: string, playerId: string): Promise<boolean> {
    const match = await (await MatchRepository).getOneBy(matchId);
    if (!match) {
      throw new HttpError(404, 'match not found');
    }

    const player = await axios
      .get(config.PLAYERS_API.URL + playerId)
      .then((res: { data: IPlayer }) => res.data);

    if (player._id.toString() === '') {
      throw new HttpError(404, 'player not found');
    }
    if (!match.team1.number || !match.team2.number) {
      throw new HttpError(400, 'teams not affected');
    }

    const calendar = await axios
      .get(config.CALENDAR_API.URL + 'match/' + match._id.toString())
      .then((res: { data: ICalendar }) => res.data);

    const tournament = await axios
      .get(config.TOURNAMENTS_API.URL + calendar.tournament.toString())
      .then((res: { data: ITournament }) => res.data);

    scorePoint(match, playerId, calendar, tournament);
    await (await MatchRepository).update(matchId, match);

    const updatedMatch = await (await MatchRepository).getOneWithTeams(matchId);
    const socket = io(config.WEBSOCKET_API.URL + 'matches');
    socket.emit('score_updated', updatedMatch);

    return await (
      await MatchRepository
    )
      .update(matchId, match)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Assign a team for a match
   * @param id Match ID
   * @param team Informations about the team
   * @returns
   */
  async assignTeamToMatch(id: string, team: ITeam): Promise<Match> {
    const match = await (await MatchRepository).getOneBy(id);
    if (!match) {
      throw new HttpError(404, 'match not found');
    }

    if (team.number === 1 && !match.team1.player1) {
      match.team1 = new Team(
        team.number,
        new ObjectId(team.player1?.toString()),
        team.player2 ? new ObjectId(team.player2.toString()) : undefined
      );
      match.team1.player1 = new ObjectId(team.player1?.toString());
      if (match.team1.player2) {
        match.team1.player2 = new ObjectId(team.player2?.toString());
      }
    } else if (team.number === 2 && !match.team2.player1) {
      match.team2 = new Team(
        team.number ?? 2,
        new ObjectId(team.player1?.toString()),
        team.player2 ? new ObjectId(team.player2.toString()) : undefined
      );
      match.team2.player1 = new ObjectId(team.player1?.toString());
      if (match.team2.player2) {
        match.team2.player2 = new ObjectId(team.player2?.toString());
      }
    }

    return await (await MatchRepository)
      .update(match._id, match)
      .then(() => match as Match);
  }
}
