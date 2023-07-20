import { MatchRound, MatchState, PlayerCategory } from "core/enums";
import { ICalendar, IMatch, IPlayer, ITeam, ITournament } from "core/interfaces";
import { ListMatchesRequest, MatchRequest } from "core/requests/MatchRequest";

const dotenv = require('dotenv');
dotenv.config({path: '.env.test'});
const config = require('core/config/config').config;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.CORE.DB.MONGO.TYPE + '://' + config.CORE.DB.MONGO.HOST + ':' + config.CORE.DB.MONGO.PORT, {monitorCommands: true});
const matches = require('../src/seeds/matches.json');
const players = require('back-players/dist/src/seeds/players.json');
const calendars = require('back-calendar/dist/src/seeds/calendar.json');
const tournaments = require('back-tournaments/dist/src/seeds/tournaments.json');
import { MatchService } from '../src/services/matchService'
import { ObjectId } from "mongodb";
const service = new MatchService()
import axios from "axios";

jest.mock("axios");

(axios.get as jest.Mock).mockImplementation((url) => {
    if (url === `${config.PLAYERS_API.URL}111111111111`) {
        return Promise.resolve({data: {_id: ''}})
    } else if (url === `${config.PLAYERS_API.URL}222222222222`) {
        return Promise.resolve({data: players[0]})
    } else if (url.startsWith(`${config.CALENDAR_API.URL}match/`)) {
        return Promise.resolve({data: calendars[0]})
    } else if (url.startsWith(`${config.TOURNAMENTS_API.URL}`)) {
        return Promise.resolve({data: tournaments[0]})
    }
})

/* Connecting to the database before each test. */
beforeAll(async () => {
    await client.connect();

    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').insertMany(players)
    const cursorPlayers = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').find();
    (await cursorPlayers.toArray()).forEach((row: IPlayer) => {
        players.find((e: IPlayer) => e.infos.lastName === row.infos.lastName)._id = row._id.toString()
    })

    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').insertMany(tournaments)
    const cursorTournaments = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').find();
    (await cursorTournaments.toArray()).forEach((row: ITournament) => {
        tournaments.find((e: ITournament) => e.name === row.name)._id = row._id.toString()
    })
    
    calendars.forEach((cal: ICalendar) => {
        cal.tournament = new ObjectId(tournaments[0]._id);
    })
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('calendar').insertMany(calendars)
    const cursorCalendars = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('calendar').find();
    (await cursorCalendars.toArray()).forEach((row: ICalendar) => {
        calendars.find((e: ICalendar) => e.tournament.toString() === row.tournament.toString())._id = row._id?.toString() ?? ''
    })
    matches.forEach((match: IMatch) => {
        match.calendar = new ObjectId(calendars[0]._id)
    })

    matches[0].team1.player1 = new ObjectId(players[0]._id);
    matches[0].team2.player1 = new ObjectId(players[1]._id);
    matches[1].team1.player1 = new ObjectId(players[2]._id);
    matches[1].team2.player1 = new ObjectId(players[3]._id);
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('matches').insertMany(matches)
    const cursorMatches = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('matches').find();
    (await cursorMatches.toArray()).forEach((row: IMatch) => {
        matches.find((e: IMatch) => e.number === row.number)._id = row._id?.toString() ?? ''
    })
});

/* Closing database connection after each test. */
afterAll(async () => {
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('matches').drop()
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').drop()
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('calendar').drop()
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').drop()
    await client.close();
});

describe('Testing the service/list', () => {
    it('should return all matches', async () => {
        const req = new ListMatchesRequest()
        const res = await service.list(req)
        expect(res.length).toBe(matches.length)
    })

    it('shoud return only the second match', async () => {
        const req = new ListMatchesRequest()
        req.results = 1
        req.skip = 1
        const res = await service.list(req)
        expect(res.length).toBe(1)
        expect(res[0]._id.toString()).toBe(matches[1]._id.toString())
    })

    it('should return every match', async () => {
        const req = new ListMatchesRequest()
        req.calendar = calendars[0]._id;
        const res = await service.list(req)
        expect(res.length).toBe(matches.length)
    })

    it('should return all matches not started yet', async () => {
        const req = new ListMatchesRequest()
        req.state = MatchState.NOT_BEGUN;
        const res = await service.list(req)
        expect(res.length).toBe(matches.filter((m: IMatch) => m.state === MatchState.NOT_BEGUN).length)
    })

    it('should return all matches in progress', async () => {
        const req = new ListMatchesRequest()
        req.state = MatchState.IN_PROGRESS;
        const res = await service.list(req)
        expect(res.length).toBe(matches.filter((m: IMatch) => m.state === MatchState.IN_PROGRESS).length)
    })

    it(`should return all matches where ${players[0].infos.lastName} is playing`, async () => {
        const req = new ListMatchesRequest()
        req.name = players[0].infos.lastName;
        const res = await service.list(req)
        expect(res.length).toBe(1)
    })

    it(`should return all matches where start date is at least ${matches[0].startDate}`, async () => {
        const req = new ListMatchesRequest()
        req.startDate = matches[0].startDate;
        const res = await service.list(req)
        expect(res.length).toBe(1)
    })

    it(`should return all matches where start date is at most ${matches[0].startDate}`, async () => {
        const req = new ListMatchesRequest()
        req.endDate = matches[0].startDate;
        const res = await service.list(req)
        expect(res.length).toBe(1)
    })

    it(`should return all matches where the tournament is ${tournaments[0]._id}`, async () => {
        const req = new ListMatchesRequest()
        req.tournament = tournaments[0]._id;
        const res = await service.list(req)
        expect(res.length).toBe(3)
    })

    it(`should return all matches where the category is ATP`, async () => {
        const req = new ListMatchesRequest()
        req.category = PlayerCategory.ATP;
        const res = await service.list(req)
        expect(res.length).toBe(2)
    })
})

describe('Testing the service/count', () => {
    it(`should return ${matches.length}`, async () => {
        const req = new ListMatchesRequest()
        const res = await service.count(req)
        expect(res).toBe(matches.length)
    })

    it(`should return ${matches.length}`, async () => {
        const req = new ListMatchesRequest()
        req.calendar = calendars[0]._id;
        const res = await service.count(req)
        expect(res).toBe(matches.length)
    })

    it(`should return ${matches.filter((m: IMatch) => m.state === MatchState.NOT_BEGUN).length}`, async () => {
        const req = new ListMatchesRequest()
        req.state = MatchState.NOT_BEGUN;
        const res = await service.count(req)
        expect(res).toBe(matches.filter((m: IMatch) => m.state === MatchState.NOT_BEGUN).length)
    })

    it(`should return ${matches.filter((m: IMatch) => m.state === MatchState.IN_PROGRESS).length}`, async () => {
        const req = new ListMatchesRequest()
        req.state = MatchState.IN_PROGRESS;
        const res = await service.count(req)
        expect(res).toBe(matches.filter((m: IMatch) => m.state === MatchState.IN_PROGRESS).length)
    })

    it(`should return all matches where ${players[0].infos.lastName} is playing`, async () => {
        const req = new ListMatchesRequest()
        req.name = players[0].infos.lastName;
        const res = await service.count(req)
        expect(res).toBe(1)
    })

    it(`should return all matches where start date is at least ${matches[0].startDate}`, async () => {
        const req = new ListMatchesRequest()
        req.startDate = matches[0].startDate;
        const res = await service.count(req)
        expect(res).toBe(matches.filter((m: IMatch) => m.startDate === matches[0].startDate).length)
    })

    it(`should return all matches where start date is at most ${matches[0].startDate}`, async () => {
        const req = new ListMatchesRequest()
        req.endDate = matches[0].startDate;
        const res = await service.count(req)
        expect(res).toBe(matches.filter((m: IMatch) => m.startDate === matches[0].startDate).length)
    })

    it(`should return all matches where the tournament is ${tournaments[0]._id}`, async () => {
        const req = new ListMatchesRequest()
        req.tournament = tournaments[0]._id;
        const res = await service.count(req)
        expect(res).toBe(3)
    })

    it(`should return all matches where the category is ATP`, async () => {
        const req = new ListMatchesRequest()
        req.category = PlayerCategory.ATP;
        const res = await service.count(req)
        expect(res).toBe(2)
    })
})

describe('Testing the service/create', () => {
    const request = new MatchRequest()
    it('should throw a bad request error', async () => {
        await expect(service.create(request)).rejects.toThrowError()
    })

    it('should create a new match', async () => {
        const request = {
            team1: {
                number: 1
            },
            team2: {
                number: 2
            },
            round: MatchRound.FINAL,
            number: 1,
            calendar: calendars[0]._id
        } as MatchRequest;
        const match = await service.create(request);
        expect(match).toMatchObject({
            number: request.number,
            round: request.round
        })
    })
})

describe('Testing the service/update', () => {
    let request = new MatchRequest()

    it('should throw a bad request error', async () => {
        await expect(service.update(matches[0]._id, request)).rejects.toThrowError()
    })

    it('should throw an error because of a non existing match', async() => {
        request = matches[0]
    
        await expect(service.update('111111111111', request)).rejects.toThrowError('match not found')
    })

    it('should update an existing user', async () => {
        request = matches[0]
    
        const match = await service.update(matches[0]._id, request);
        expect(match).toMatchObject({
            startDate: matches[0].startDate,
            _id: matches[0]._id,
            round: matches[0].round
        })
    })
})

describe('Testing the service/updateScore', () => {
    it('should throw a match not found error', async () => {
        await expect(service.updateScore('111111111111', '111111111111')).rejects.toThrowError('match not found')
    })

    it('should throw a player not found error', async () => {
        await expect(service.updateScore(matches[0]._id, '111111111111')).rejects.toThrowError('player not found')
    })

    it('should throw an error "teams not attributed"', async () => {
        const {_id} = await service.create({
            round: MatchRound.FINAL,
            number: 1,
            calendar: calendars[0]._id
        } as MatchRequest)
        await expect(service.updateScore((_id ?? '').toString(), '222222222222')).rejects.toThrowError('teams not attributed')
    })

    it('should return "true"', async () => {
        await expect(service.updateScore(matches[0]._id, '222222222222')).resolves.toBeTruthy()
    })
})

describe('Testing the service/assignTeamToMatch', () => {
    it('should throw a "match not found" error', async () => {
        await expect(service.assignTeamToMatch('111111111111', undefined as unknown as ITeam)).rejects.toThrowError('match not found')
    })

    it('should affect team 1 with one player', async () => {
        const {_id} = await service.create({
            round: MatchRound.FINAL,
            number: 1,
            calendar: calendars[0]._id
        } as MatchRequest)
        const team = {
            number: 1,
            player1: players[0]._id
        }
        await expect(service.assignTeamToMatch((_id ?? '').toString(), team)).resolves.toMatchObject({
            _id,
            team1: {
                player1: players[0]._id
            }
        })
    })

    it('should affect team 1 with two players', async () => {
        const {_id} = await service.create({
            round: MatchRound.FINAL,
            number: 1,
            calendar: calendars[0]._id
        } as MatchRequest)
        const team = {
            number: 1,
            player1: players[0]._id,
            player2: players[1]._id
        }
        await expect(service.assignTeamToMatch((_id ?? '').toString(), team)).resolves.toMatchObject({
            _id,
            team1: {
                player1: players[0]._id,
                player2: players[1]._id
            }
        })
    })

    it('should affect team 2 with one player', async () => {
        const {_id} = await service.create({
            round: MatchRound.FINAL,
            number: 1,
            calendar: calendars[0]._id
        } as MatchRequest)
        const team = {
            number: 2,
            player1: players[0]._id
        }
        await expect(service.assignTeamToMatch((_id ?? '').toString(), team)).resolves.toMatchObject({
            _id,
            team2: {
                player1: players[0]._id
            }
        })
    })

    it('should affect team 2 with two players', async () => {
        const {_id} = await service.create({
            round: MatchRound.FINAL,
            number: 1,
            calendar: calendars[0]._id
        } as MatchRequest)
        const team = {
            number: 2,
            player1: players[0]._id,
            player2: players[1]._id
        }
        await expect(service.assignTeamToMatch((_id ?? '').toString(), team)).resolves.toMatchObject({
            _id,
            team2: {
                player1: players[0]._id,
                player2: players[1]._id
            }
        })
    })
})