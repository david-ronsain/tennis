const dotenv = require('dotenv');
dotenv.config({path: '.env.test'});
const config = require('core/config/config').config;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.CORE.DB.MONGO.TYPE + '://' + config.CORE.DB.MONGO.HOST + ':' + config.CORE.DB.MONGO.PORT, {monitorCommands: true});
const calendars = require('../src/seeds/calendar.json');
const players = require('back-players/dist/src/seeds/players.json');
const tournaments = require('back-tournaments/dist/src/seeds/tournaments.json');
import { CalendarService } from '../src/services/calendarService'
import { ObjectId } from "mongodb";
const service = new CalendarService()
import axios from "axios";
import { ICalendar, IPlayer, ITournament } from 'core/interfaces';
import { CalendarRequest } from 'core/requests';
import { HttpError } from 'routing-controllers';
import { MatchType, PlayerCategory } from 'core/enums';

jest.mock("axios");

(axios.post as jest.Mock).mockImplementation((url: string) => {
    if (url.toString().startsWith(`${config.MATCHES_API.URL}`)) {
        return Promise.resolve({data: {_id: new ObjectId()}})
    }
});
(axios.get as jest.Mock).mockImplementation((url) => {
    if (url.toString().startsWith(`${config.PLAYERS_API.URL}`)) {
        return Promise.resolve({data: [players[0], players[1]]})
    } else if (url.startsWith(`${config.TOURNAMENTS_API.URL}`)) {
        return Promise.resolve({data: tournaments[0]})
    }
})

/* Connecting to the database before each test. */
beforeAll(async () => {
    await client.connect();

    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').insertMany(tournaments)
    const cursorTournaments = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').find();
    (await cursorTournaments.toArray()).forEach((row: ITournament, index: number) => {
        calendars[index].tournament = new ObjectId(row._id)
        tournaments.find((e: ITournament) => e.name === row.name)._id = row._id.toString()
    })
    
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('calendar').insertMany(calendars)
    const cursorCalendars = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('calendar').find();
    (await cursorCalendars.toArray()).forEach((row: ICalendar) => {
        calendars.find((e: ICalendar) => e.tournament.toString() === row.tournament.toString())._id = row._id?.toString() ?? ''
    })

    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').insertMany(players)
    const cursorPlayers = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').find();
    (await cursorPlayers.toArray()).forEach((row: IPlayer) => {
        players.find((e: IPlayer) => e.infos.lastName === row.infos.lastName)._id = row._id.toString()
    })
});

/* Closing database connection after each test. */
afterAll(async () => {
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('calendar').drop()
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').drop()
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').drop()
    await client.close();
});

describe('Testing the service/list', () => {
    it('should return all calendars', async () => {
        const cals = await service.list({})
        expect(cals.length).toBe(calendars.length)
    })

    it('should return the first calendar', async () => {
        const cals = await service.list({results: 1})
        expect(cals.length).toBe(1)
        expect(cals[0]._id.toString()).toBe(calendars[0]._id.toString())
    })
    it('should return the second calendar', async () => {
        const cals = await service.list({results: 1, skip: 1})
        expect(cals[0]._id.toString()).toBe(calendars[1]._id.toString())
    })
    it(`should return all calendars for the tournament ${tournaments[0].name} by name`, async () => {
        const cals = await service.list({name: tournaments[0].name})
        expect(cals.length).toBe(1)
        expect((cals[0].tournament as ITournament)._id.toString()).toBe(calendars[0].tournament.toString())
    })
    it(`should return all calendars for the tournament ${tournaments[0].name} by id`, async () => {
        const cals = await service.list({tournament: tournaments[0]._id.toString()})
        expect(cals.length).toBe(1)
        expect((cals[0].tournament as ITournament)._id.toString()).toBe(calendars[0].tournament.toString())
    })
    it('should return all calendars where the start date is between the provided dates', async () => {
        const cals = await service.list({startDate: '2023-07-01', endDate: '2023-07-05'})
        expect(cals.length).toBe(1)
        expect(cals[0]._id.toString()).toBe(calendars[0]._id.toString())
    })
    it('should return all calendars where the end date is between the provided dates', async () => {
        const cals = await service.list({startDate: '2023-07-15', endDate: '2023-07-17'})
        expect(cals.length).toBe(1)
        expect(cals[0]._id.toString()).toBe(calendars[0]._id.toString())
    })
    it('should return all calendars where the dates are between the provided dates', async () => {
        const cals = await service.list({startDate: '2023-07-01', endDate: '2023-07-17'})
        expect(cals.length).toBe(1)
        expect(cals[0]._id.toString()).toBe(calendars[0]._id.toString())
    })
    it('should return all calendars where the provided dates are within the dates of a tournament', async () => {
        const cals = await service.list({startDate: '2023-07-07', endDate: '2023-07-09'})
        expect(cals.length).toBe(1)
        expect(cals[0]._id.toString()).toBe(calendars[0]._id.toString())
    })
    it('should return all calendars played between two dates', async () => {
        const cals = await service.list({startDate: '2023-05-07', endDate: '2023-07-09'})
        expect(cals.length).toBe(2)
    })
})

describe('Testing the service/count', () => {
    it('should return all calendars', async () => {
        const nb = await service.count({})
        expect(nb).toBe(calendars.length)
    })
    it(`should return all calendars for the tournament ${tournaments[0].name} by name`, async () => {
        const nb = await service.count({name: tournaments[0].name})
        expect(nb).toBe(1)
    })
    it(`should return all calendars for the tournament ${tournaments[0].name} by id`, async () => {
        const nb = await service.count({tournament: tournaments[0]._id.toString()})
        expect(nb).toBe(1)
    })
    it('should return all calendars where the start date is between the provided dates', async () => {
        const nb = await service.count({startDate: '2023-07-01', endDate: '2023-07-05'})
        expect(nb).toBe(1)
    })
    it('should return all calendars where the end date is between the provided dates', async () => {
        const nb = await service.count({startDate: '2023-07-15', endDate: '2023-07-17'})
        expect(nb).toBe(1)
    })
    it('should return all calendars where the dates are between the provided dates', async () => {
        const nb = await service.count({startDate: '2023-07-01', endDate: '2023-07-17'})
        expect(nb).toBe(1)
    })
    it('should return all calendars where the provided dates are within the dates of a tournament', async () => {
        const nb = await service.count({startDate: '2023-07-07', endDate: '2023-07-09'})
        expect(nb).toBe(1)
    })
    it('should return all calendars played between two dates', async () => {
        const nb = await service.count({startDate: '2023-05-07', endDate: '2023-07-09'})
        expect(nb).toBe(2)
    })
})

describe('Testing the service/getMatchById', () => {
    it('should throw an error if the match does not exist', async () => {
        await expect(service.getByMatchId('111111111111')).rejects.toThrowError('calendar not found')
    })
})

describe('Testing the service/create', () => {
    it('should fail because of an incorrect request', async () => {
        const req = new CalendarRequest()
        await expect(service.create(req)).rejects.toThrow(HttpError)
    })

    it('should create a new calendar', async () => {
        const req = new CalendarRequest()
        req.tournament = tournaments[0]._id.toString()
        req.prizeMoney = 1000000
        req.startDate = '2024-07-02'
        req.endDate = '2024-07-16'
        const cal = await service.create(req)
        expect(cal._id.toString()).not.toBeUndefined()
        expect(cal.tournament.toString()).toBe(tournaments[0]._id.toString())
    })
})

describe('Testing the service/update', () => {
    it('should fail because of an incorrect request', async () => {
        const req = new CalendarRequest()
        await expect(service.update('111111111111', req)).rejects.toThrow(HttpError)
    })

    it('should throw a "tournament not found" error', async () => {
        const req = new CalendarRequest()
        req.tournament = tournaments[0]._id.toString()
        req.prizeMoney = 1000000
        req.startDate = '2024-07-02'
        req.endDate = '2024-07-16'
        await expect(service.update('111111111111', req)).rejects.toThrowError('tournament not found')
    })

    it('should update an existing calendar', async () => {
        const req = new CalendarRequest()
        req.tournament = tournaments[1]._id.toString()
        req.prizeMoney = 1000000
        req.startDate = '2024-07-02'
        req.endDate = '2024-07-16'
        const cal = await service.update(calendars[0]._id.toString(), req)
        expect(cal._id.toString()).toBe(calendars[0]._id.toString())
        expect(cal.tournament.toString()).toBe(tournaments[1]._id.toString())
    })
})

describe('Testing the service/drawMatches', () => {
    it('should throw a "calendar not found" error', async () => {
        await expect(service.drawMatches('111111111111')).rejects.toThrowError('calendar not found')
    })

    it('should throw an "already drawn" error', async () => {
        await expect(service.drawMatches(calendars[0]._id.toString())).rejects.toThrowError('already drawn')
    })

    it('should draw the matches for this calendar', async () => {
        const cal = await service.create({
            tournament: tournaments[0]._id.toString(),
            prizeMoney: 10000000,
            startDate: '2024-07-02',
            endDate: '2024-07-16'
        })
        const drawnCal = await service.drawMatches(cal._id.toString())
        expect(drawnCal.draw?.SINGLES.ATP.length).not.toBe(0)
    })
})

describe('Testing the service/getByPosition', () => {
    it('should throw a "calendar not found" error', async () => {
        await expect(service.getByPosition('111111111111', MatchType.SINGLES, PlayerCategory.ATP, 1)).rejects.toThrowError('calendar not found')
    })

    it('should throw a "match not found" error', async () => {
        await expect(service.getByPosition(calendars[0]._id.toString(), MatchType.SINGLES, PlayerCategory.ATP, 1111111)).rejects.toThrowError('match not found')
    })

    it('should return the first singles atp match', async () => {
        await expect(service.getByPosition(calendars[0]._id.toString(), MatchType.SINGLES, PlayerCategory.ATP, 0)).resolves.toBeTruthy()
    })
})

describe('Testing the service/getDraw', () => {
    it('should throw a "draw not found" error"', async () => {
        const cal = await service.create({
            tournament: tournaments[0]._id.toString(),
            prizeMoney: 10000000,
            startDate: '2024-07-02',
            endDate: '2024-07-16'
        })
        await expect(service.getDraw(cal._id.toString())).rejects.toThrowError('draw not found')
    })

    it('should throw a "calendar not found" error"', async () => {
        await expect(service.getDraw('111111111111')).rejects.toThrowError('calendar not found')
    })

    it('should return the draw', async () => {
        const cal = await service.create({
            tournament: tournaments[0]._id.toString(),
            prizeMoney: 10000000,
            startDate: '2024-07-02',
            endDate: '2024-07-16'
        })
        await service.drawMatches(cal._id.toString())
        await expect(service.getDraw(cal._id.toString())).resolves.toBeTruthy()
    })
})