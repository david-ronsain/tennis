import { MatchRound, MatchState } from 'core/enums';
import { MatchEntity, Score, Team } from '../entities/MatchEntity';
import { MatchRequest } from 'core/requests';
import { EventEmitter } from 'node:events';
import { IAssignPlayerEvent } from 'core/events';
import { ICalendar, ITournament } from 'core/interfaces';
import { ObjectId } from 'mongodb';
import { eventManager } from '../subscribers';

const updateMatch = (match: MatchEntity, request: MatchRequest): void => {
  match.startDate = request.startDate;
  match.endDate = request.endDate;
  match.number = request.number;
  match.round = request.round;
  match.score = request.score;
  match.team1 = request.team1 as Team;
  if (typeof match.team1.player1 === 'string') {
    match.team1.player1 = new ObjectId(match.team1.player1);
  }
  if (typeof match.team1.player2 === 'string') {
    match.team1.player2 = new ObjectId(match.team1.player2);
  }
  match.team2 = request.team2 as Team;
  if (typeof match.team2.player1 === 'string') {
    match.team2.player1 = new ObjectId(match.team2.player1);
  }
  if (typeof match.team2.player2 === 'string') {
    match.team2.player2 = new ObjectId(match.team2.player2);
  }
  match.team2 = request.team2 as Team;
  match.updatedAt = new Date().toISOString();

  if (request.state) {
    match.state = request.state;
  }
};

const scorePoint = (
  match: MatchEntity,
  playerId: string,
  calendar: ICalendar,
  tournament: ITournament
): void => {
  if (
    match.state &&
    ![MatchState.IN_PROGRESS, MatchState.NOT_BEGUN].includes(match.state)
  ) {
    return;
  }

  if (!match.score) {
    match.score = new Score();
    match.state = MatchState.IN_PROGRESS;
    match.startDate = new Date().toISOString();
  }

  if (!!match.team1.number && !!match.team2.number) {
    const teamWonPoint: number =
      match.team1.player1?.toString() === playerId ||
      match.team1.player2?.toString() === playerId
        ? match.team1.number
        : match.team2.number;
    match.score.points.push([match.score.points.length, teamWonPoint]);

    const team1WonPoints = match.score.points.filter(
      (p) => p[1] === match.team1.number
    ).length;
    const team2WonPoints = match.score.points.filter(
      (p) => p[1] === match.team2.number
    ).length;
    let team1WonGames = match.score.games.filter(
      (g) => g[1] === match.team1.number
    ).length;
    let team2WonGames = match.score.games.filter(
      (g) => g[1] === match.team2.number
    ).length;

    const minPointsToWinGame =
      team1WonGames === 6 && team2WonGames === 6 ? 7 : 4;
    if (
      (team1WonPoints >= minPointsToWinGame &&
        team1WonPoints - team2WonPoints > 1) ||
      (team2WonPoints >= minPointsToWinGame &&
        team2WonPoints - team1WonPoints > 1)
    ) {
      match.score.games.push([match.score.games.length, teamWonPoint]);
      match.score.points = [];
    }

    team1WonGames = match.score.games.filter(
      (g) => g[1] === match.team1.number
    ).length;
    team2WonGames = match.score.games.filter(
      (g) => g[1] === match.team2.number
    ).length;

    if (
      (teamWonPoint === match.team1.number &&
        ((team1WonGames === 6 && team2WonGames < 5) ||
          (team1WonGames === 7 && team2WonGames >= 5))) ||
      (teamWonPoint === match.team2.number &&
        ((team2WonGames === 6 && team1WonGames < 5) ||
          (team2WonGames === 7 && team1WonGames >= 5)))
    ) {
      match.score.sets.push([match.score.sets.length, teamWonPoint]);
      match.score.games = [];
      match.score.history.push([team1WonGames, team2WonGames]);
    }

    const team1WonSets = match.score.sets.filter(
      (s) => s[1] === match.team1.number
    ).length;
    const team2WonSets = match.score.sets.filter(
      (s) => s[1] === match.team2.number
    ).length;

    if (team1WonSets === 2 || team2WonSets === 2) {
      match.score.sets = [];
      match.state = MatchState.FINISHED;
      match.endDate = new Date().toISOString();

      if (teamWonPoint === match.team1.number) {
        match.team1.isWinner = true;
      } else {
        match.team2.isWinner = true;
      }

      if (match.round !== MatchRound.FINAL) {
        eventManager.emit('assignPlayerToNextMatch', {
          round: match.round,
          team: match.team1.isWinner ? match.team1 : match.team2,
          _id: match._id?.toString(),
          number: match.number,
          calendar,
          tournament
        } as IAssignPlayerEvent);
      }
    }
  }
};

export { updateMatch, scorePoint };
