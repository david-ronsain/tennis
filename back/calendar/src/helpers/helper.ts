import { MatchType, PlayerCategory, TournamentCategory } from 'core/enums';
import { CalendarEntity } from '../entities/calendarEntity';
import { CalendarRequest, MatchRequest } from 'core/requests';
import { IPlayer } from 'core/interfaces';
import { Match, Team } from 'back-matches/src/entities/MatchEntity';
import { ObjectId } from 'mongodb';
import axios from 'axios';
import { config } from 'core/config/config';
import * as jwt from 'jsonwebtoken';
import { getNbMatchesForRound, getRounds } from 'core/helpers';

const updateCalendar = (
  calendar: CalendarEntity,
  request: CalendarRequest
): void => {
  calendar.startDate = request.startDate;
  calendar.endDate = request.endDate;
  calendar.tournament = request.tournament;
  calendar.prizeMoney = request.prizeMoney;
  calendar.updatedAt = new Date().toISOString();
};

const assignPlayersToTeams = (
  type: MatchType,
  players: IPlayer[]
): { team1: Team; team2: Team; drawnPlayers: string[] } => {
  if (players.length === 2 && type === MatchType.SINGLES) {
    return {
      team1: new Team(1, players[0]._id),
      team2: new Team(2, players[1]._id),
      drawnPlayers: players.map((p) => p._id.toString())
    };
  } else if (players.length === 4 && type === MatchType.DOUBLES) {
    return {
      team1: new Team(1, players[0]._id, players[1]._id),
      team2: new Team(2, players[2]._id, players[3]._id),
      drawnPlayers: players.map((p) => p._id.toString())
    };
  }
  return {
    team1: new Team(1),
    team2: new Team(2),
    drawnPlayers: []
  };
};

const drawMatches = async (
  category: TournamentCategory,
  calendarId: string,
  forceTest?: boolean
): Promise<Record<MatchType, Record<PlayerCategory, ObjectId[]>>> => {
  const matches = {
    [MatchType.SINGLES]: {
      [PlayerCategory.ATP]: [] as ObjectId[],
      [PlayerCategory.WTA]: [] as ObjectId[]
    },
    [MatchType.DOUBLES]: {
      [PlayerCategory.ATP]: [] as ObjectId[],
      [PlayerCategory.WTA]: [] as ObjectId[]
    }
  };

  const matchesValues = Object.values(matches);
  const matchesKeys = Object.keys(matches);

  for (let x = 0, matchType = matchesValues[x]; x < matchesValues.length; x++) {
    const rounds = getRounds(category, forceTest);
    const firstRound = rounds[0];

    const matchTypesValues = Object.values(matchType);
    const matchTypesKeys = Object.keys(matchType);

    for (let y = 0; y < matchTypesValues.length; y++) {
      let matchNumber = 1;

      for (const round of rounds) {
        const nbMatchesForThisRound = getNbMatchesForRound(round);
        const playersDrawn: string[] = [];

        for (let i = 0; i < nbMatchesForThisRound; i++, matchNumber++) {
          const matchRequest = new MatchRequest();
          matchRequest.round = round;
          matchRequest.number = matchNumber;
          matchRequest.calendar = calendarId;

          let players: IPlayer[] = [];
          if (round === firstRound) {
            const nbPlayersToDraw =
              (matchesKeys[x] as MatchType) === MatchType.DOUBLES ? 4 : 2;
            if (config.CORE.NODE_ENV !== 'test') {
              players = await axios
                .get(
                  ((config.PLAYERS_API.URL +
                    '?category=' +
                    matchTypesKeys[y]) as PlayerCategory) +
                    (playersDrawn.length
                      ? '&exclude=' + playersDrawn.join(',')
                      : '') +
                    '&results=' +
                    nbPlayersToDraw.toString()
                )
                .then((res: { data: IPlayer[] }) => res.data);
            }
          }
          const teams = assignPlayersToTeams(
            matchesKeys[x] as MatchType,
            players
          );
          matchRequest.team1 = teams.team1;
          matchRequest.team2 = teams.team2;
          playersDrawn.push(...teams.drawnPlayers);

          if (config.CORE.NODE_ENV !== 'test') {
            await axios
              .post(config.MATCHES_API.URL, new Match(matchRequest), {
                headers: {
                  authorization:
                    'Bearer ' +
                    jwt.sign(
                      {
                        login: config.CORE.MASTER_LOGIN,
                        password: config.CORE.MASTER_PASSWORD,
                        iat: Math.floor(Date.now() / 1000) + 3600
                      },
                      config.CORE.JWT_SECRET,
                      { expiresIn: config.CORE.JWT_VALIDITY }
                    )
                }
              })
              .then((res: { data: { _id: ObjectId } }) => {
                matches[matchesKeys[x] as MatchType][
                  matchTypesKeys[y] as PlayerCategory
                ].push(new ObjectId(res.data._id));
              });
          } else {
            matches[matchesKeys[x] as MatchType][
              matchTypesKeys[y] as PlayerCategory
            ].push(new ObjectId());
          }
        }
      }
    }
  }

  return matches;
};

export {
  updateCalendar,
  assignPlayersToTeams,
  getNbMatchesForRound,
  drawMatches,
  getRounds
};
