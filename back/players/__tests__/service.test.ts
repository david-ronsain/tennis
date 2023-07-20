import { IPlayer } from "core/interfaces";
import { GetPlayersRequest, PlayerInfoRequest, PlayerRequest, PlayerStyleRequest } from "core/requests/PlayerRequest";
import { PlayerService } from "../src/services/playerService";
import { Country, PlayerBackhand, PlayerCategory, PlayerMainHand } from "core/enums";

const dotenv = require('dotenv');
dotenv.config();
const config = require('core/config/config').config;
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.CORE.DB.MONGO.TYPE + '://' + config.CORE.DB.MONGO.HOST + ':' + config.CORE.DB.MONGO.PORT);
const players = require('../src/seeds/players.json');
const service = new PlayerService()


/* Connecting to the database before each test. */
beforeAll(async () => {
    await client.connect();
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').insertMany(players)
    const cursorPlayers = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').find();
    (await cursorPlayers.toArray()).forEach((row: IPlayer) => {
        players.find((e: IPlayer) => e.infos.lastName === row.infos.lastName)._id = row._id.toString()
    })
});

/* Closing database connection after each test. */
afterAll(async () => {
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').drop()
    await client.close();
});

describe('Testing the service/list', () => {
    it('should return 4 players', async () => {
        const request = new GetPlayersRequest();
        const p = await service.list(request);
        expect(p.length).toBe(4)
    })

    it('should return only nadal', async () => {
        const request = new GetPlayersRequest();
        request.name = 'Nad'
        const p = await service.list(request);
        expect(p.length).toBe(1)
        expect(p[0].infos.lastName === request.name)
    })

    it('should return no one', async () => {
        const request = new GetPlayersRequest();
        request.name = 'Nad'
        request.skip = 1
        const p = await service.list(request);
        expect(p.length).toBe(0)
    })

    it('should return only ATP players', async () => {
        const request = new GetPlayersRequest();
        request.category = PlayerCategory.ATP
        const p = await service.list(request);
        expect(p.length).toBe(4)
    })

    it('should return only WTA players', async () => {
        const request = new GetPlayersRequest();
        request.category = PlayerCategory.WTA
        const p = await service.list(request);
        expect(p.length).toBe(0)
    })
})

describe('Testing the service/count', () => {
    it('should return 4', async () => {
        const request = new GetPlayersRequest();
        const p = await service.count(request);
        expect(p).toBe(4)
    })

    it('should return 1', async () => {
        const request = new GetPlayersRequest();
        request.name = 'Nad'
        const p = await service.count(request);
        expect(p).toBe(1)
    })

    it('should return only ATP players (4)', async () => {
        const request = new GetPlayersRequest();
        request.category = PlayerCategory.ATP
        const p = await service.count(request);
        expect(p).toBe(4)
    })

    it('should return only WTA players', async () => {
        const request = new GetPlayersRequest();
        request.category = PlayerCategory.WTA
        const p = await service.count(request);
        expect(p).toBe(0)
    })
})

describe('Testing the service/getById', () => {
    it('shoud return a player', async () => {
        const player = await service.getById(players[0]._id)
        expect(player.infos.lastName).toBe(players[0].infos.lastName)
    })

    it('shoud throw an error', async () => {
        await expect(service.getById('111111111111')).rejects.toThrow('player not found')
    })
})

describe('Testing the service/create', () => {
    const request = new PlayerRequest()
    it('should throw a bad request error', async () => {
        await expect(service.create(request)).rejects.toThrowError()
    })

    request.infos = undefined as unknown as PlayerInfoRequest
    request.style = undefined as unknown as PlayerStyleRequest
    it('should throw a bad request error', async () => {
        await expect(service.create(request)).rejects.toThrowError()
    })
    it('should create a new user', async () => {
        const request = {
            infos: {
                firstName: 'John',
                lastName: 'Doe',
                picture: 'test.png',
                dateOfBirth: '1988-07-22',
                country: Country.UnitedStates,
                category: PlayerCategory.ATP
            }, style: {
                mainHand: PlayerMainHand.LEFT,
                backhand: PlayerBackhand.TWO_HANDED
            },
            proSince: 2004
        } as PlayerRequest;
        const player = await service.create(request);
        expect(player).toMatchObject(request)
    })
})

describe('Testing the service/update', () => {
    let request = new PlayerRequest()

    it('should throw a bad request error', async () => {
        await expect(service.update(players[0]._id, request)).rejects.toThrowError()
    })

    request.infos = undefined as unknown as PlayerInfoRequest
    request.style = undefined as unknown as PlayerStyleRequest
    it('should throw a bad request error', async () => {
        await expect(service.update(players[0]._id, request)).rejects.toThrowError()
    })

    it('should throw an error because of a non existing user', async() => {
        request = {
            infos: {
                firstName: 'John',
                lastName: 'Doe',
                picture: 'test.png',
                dateOfBirth: '1988-07-22',
                country: Country.UnitedStates,
                category: PlayerCategory.ATP
            }, style: {
                mainHand: PlayerMainHand.LEFT,
                backhand: PlayerBackhand.TWO_HANDED
            },
            proSince: 2004
        }
    
        await expect(service.update('111111111111', request)).rejects.toThrowError('player not found')
    })

    it('should update an existing user', async () => {
        request = {
            infos: {
                firstName: 'John',
                lastName: 'Doe',
                picture: 'test.png',
                dateOfBirth: '1988-07-22',
                country: Country.UnitedStates,
                category: PlayerCategory.ATP
            }, style: {
                mainHand: PlayerMainHand.LEFT,
                backhand: PlayerBackhand.TWO_HANDED
            },
            proSince: 2004
        }
    
        const player = await service.update(players[0]._id, request);
        expect(player).toMatchObject(request)
    })
})