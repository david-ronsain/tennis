import { ITournament } from 'core/interfaces';
import { TournamentService } from '../src/services/tournamentService'
import { TournamentRequest } from 'core/requests';
import { HttpError } from 'routing-controllers';
import { Country, TournamentCategory, TournamentSurface } from 'core/enums';

const dotenv = require('dotenv');
dotenv.config();
const config = require('core/config/config').config;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.CORE.DB.MONGO.TYPE + '://' + config.CORE.DB.MONGO.HOST + ':' + config.CORE.DB.MONGO.PORT);
const tournaments = require('../src/seeds/tournaments.json');
const service = new TournamentService()

/* Connecting to the database before each test. */
beforeAll(async () => {
    await client.connect();
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').insertMany(tournaments)
    const cursorPlayers = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').find();
    (await cursorPlayers.toArray()).forEach((row: ITournament) => {
        tournaments.find((e: ITournament) => e.name === row.name)._id = row._id.toString()
    })
});

/* Closing database connection after each test. */
afterAll(async () => {
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').drop()
    await client.close();
});

describe('Testing the service/list', () => {
    it('should return all tournaments', async () => {
        const t = await service.list({})
        expect(t.length).toBe(tournaments.length)
    })

    it('should return the last 2 tournaments', async () => {
        const t = await service.list({skip: 1, results: 2})
        expect(t.length).toBe(2)
    })

    it('should return the first tournaments by its name', async () => {
        const t = await service.list({name: tournaments[0].name})
        expect(t.length).toBe(1)
        expect(t[0]).toMatchObject(tournaments[0])
    })

    it('should return the first tournaments by its category', async () => {
        const t = await service.list({category: tournaments[0].category})
        expect(t.length).toBe(tournaments.filter((to: ITournament) => to.category === tournaments[0].category).length)
        expect(t[0]).toMatchObject(tournaments[0])
    })

    it('should return the first tournaments by its surface', async () => {
        const t = await service.list({surface: tournaments[0].surface})
        expect(t.length).toBe(tournaments.filter((to: ITournament) => to.surface === tournaments[0].surface).length)
        expect(t[0]).toMatchObject(tournaments[0])
    })
})

describe('Testing the service/count', () => {
    it('should return all tournaments', async () => {
        const t = await service.count({})
        expect(t).toBe(tournaments.length)
    })

    it('should return the first tournaments by its name', async () => {
        const t = await service.count({name: tournaments[0].name})
        expect(t).toBe(1)
    })

    it('should return the first tournaments by its category', async () => {
        const t = await service.count({category: tournaments[0].category})
        expect(t).toBe(tournaments.filter((to: ITournament) => to.category === tournaments[0].category).length)
    })

    it('should return the first tournaments by its surface', async () => {
        const t = await service.count({surface: tournaments[0].surface})
        expect(t).toBe(tournaments.filter((to: ITournament) => to.surface === tournaments[0].surface).length)
    })
})

describe('Testing the service/getById', () => {
    it('should throw a "tournament not found" error', async () => {
        await expect(service.getById('111111111111')).rejects.toThrowError('tournament not found')
    })

    it('should return the tournament', async () => {
        const t = await service.getById(tournaments[0]._id.toString())
        expect(t._id).toBe(tournaments[0]._id.toString())
    })
})

describe('Testing the service/create', () => {
    it('should throw an error because of an invalid request', async () => {
        const req = new TournamentRequest()
        await expect(service.create(req)).rejects.toThrowError(HttpError)
    })

    it('should create the tournament', async () => {
        const req = new TournamentRequest()
        req.category = TournamentCategory.CHALLENGER125
        req.country = Country.Afghanistan
        req.creationYear = 1990
        req.name = 'Test'
        req.prizeMoney = 123456789
        req.surface = TournamentSurface.GRASS

        await expect(service.create(req)).resolves.toMatchObject(req)
    })
})

describe('Testing the service/update', () => {
    it('should throw an error because of an invalid request', async () => {
        const req = new TournamentRequest()
        await expect(service.update('111111111111', req)).rejects.toThrowError(HttpError)
    })

    it('should throw a "tournamanent not found" error', async () => {
        const req = new TournamentRequest()
        req.category = TournamentCategory.CHALLENGER125
        req.country = Country.Afghanistan
        req.creationYear = 1990
        req.name = 'Test'
        req.prizeMoney = 123456789
        req.surface = TournamentSurface.GRASS
        await expect(service.update('111111111111', req)).rejects.toThrowError('tournament not found')
    })

    it('should update the tournament', async () => {
        const req = new TournamentRequest()
        req.category = TournamentCategory.CHALLENGER125
        req.country = Country.Afghanistan
        req.creationYear = 1990
        req.name = 'Test'
        req.prizeMoney = 123456789
        req.surface = TournamentSurface.GRASS

        await expect(service.update(tournaments[0]._id.toString(), req)).resolves.toMatchObject(req)
    })
})