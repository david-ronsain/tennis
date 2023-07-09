/* eslint-disable @typescript-eslint/no-misused-promises */
import { EventEmitter } from 'events';
import { IAssignPlayerEvent } from 'core/events';
import axios from 'axios';
import { config } from 'core/config/config';
import {
  getNbMatchesForRound,
  getRounds
} from 'back-calendar/src/helpers/helper';
import { ObjectId } from 'mongodb';
import { MatchRound, MatchType, PlayerCategory } from 'core/enums';
import jwt from 'jsonwebtoken';
import { IMatch, ITeam } from 'core/interfaces';

const eventManager = new EventEmitter();

const assignPlayerToNextMatchEvent = (): void => {
  eventManager.on('assignPlayerToNextMatch', assignPlayerToNextMatchCallback);
};

async function assignPlayerToNextMatchCallback(
  data: IAssignPlayerEvent,
  forceTest?: boolean
): Promise<{ position: number; team: ITeam }> {
  const res = {
    position: 0,
    team: data.team
  };

  if (data.round === MatchRound.FINAL) {
    throw new Error('can not assign players after a final');
  }

  const rounds = getRounds(data.tournament.category, forceTest);
  const currentRoundIndex = rounds.indexOf(data.round);
  const nextRoundIndex = currentRoundIndex + 1;
  const currentRange: number[] = [0, 0];
  const nextRange: number[] = [0, 0];

  rounds.forEach((round: MatchRound, index: number) => {
    if (index <= currentRoundIndex) {
      if (index > 0) {
        currentRange[0] += getNbMatchesForRound(rounds[index - 1]);
        nextRange[0] += getNbMatchesForRound(rounds[index - 1]);
      }
      currentRange[1] += getNbMatchesForRound(round);
      nextRange[1] += getNbMatchesForRound(round);
    } else if (index === nextRoundIndex) {
      nextRange[0] += getNbMatchesForRound(rounds[nextRoundIndex - 1]);
      nextRange[1] += getNbMatchesForRound(round);
    }
  });

  if (data.number >= currentRange[0] && data.number <= currentRange[1]) {
    const currentPosition = data.number - currentRange[0];
    res.position = nextRange[0] + Math.ceil(currentPosition / 2);
    const newTeamNumber = data.number % 2 === 1 ? 1 : 2;

    const isSingles = [
      ...(data.calendar.draw?.SINGLES.ATP.map((m: object) => m.toString()) ??
        []),
      ...(data.calendar.draw?.SINGLES.WTA.map((m: object) => m.toString()) ??
        [])
    ].includes(data._id.toString());
    const isATP = [
      ...(data.calendar.draw?.SINGLES.ATP.map((m: object) => m.toString()) ??
        []),
      ...(data.calendar.draw?.DOUBLES.ATP.map((m: object) => m.toString()) ??
        [])
    ].includes(data._id.toString());

    res.team.number = newTeamNumber;
    if (config.CORE.NODE_ENV !== 'test') {
      const matchId: string = await axios
        .get(
          config.CALENDAR_API.URL +
            `${data.calendar._id.toString()}/match/${
              isSingles ? MatchType.SINGLES : MatchType.DOUBLES
            }/${isATP ? PlayerCategory.ATP : PlayerCategory.WTA}/${
              res.position - 1
            }`
        )
        .then((res: { data: string }) => res.data)
        .catch(() => '');
      axios
        .put(config.MATCHES_API.URL + 'assign/next/' + matchId, data.team, {
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
        .catch((error: string) => {
          console.log(error);
        });
    }

    return res;
  }

  throw new Error('could not calculate new position');
}

export {
  eventManager,
  assignPlayerToNextMatchEvent,
  assignPlayerToNextMatchCallback
};
