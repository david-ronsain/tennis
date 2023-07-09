import { IPlayer } from "core/interfaces";

const MongoClient = require('mongodb').MongoClient;
const request = require("supertest");
const app = require('../index');
const dotenv = require('dotenv');
dotenv.config();
const config = require('core/config/config').config;
const client = new MongoClient(config.CORE.DB.MONGO.TYPE + '://' + config.CORE.DB.MONGO.HOST + ':' + config.CORE.DB.MONGO.PORT);
const players = require('../src/seeds/players.json');
var jwt = require('jsonwebtoken');
const { Country, PlayerCategory, PlayerMainHand, PlayerBackhand } = require('core/enums');

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

describe("GET /players", () => {
    it("should return all players", async () => {
        const res = await request(app).get("/players");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(players.length);
    });

    it("should return only 2 players", async () => {
        const res = await request(app).get("/players?results=2");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    })

    it("should return only the last player", async () => {
        const res = await request(app).get("/players?skip=2&results=1");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].infos.lastName).toBe(players[2].infos.lastName)
    })

    it("should return only the player Nadal", async () => {
        const res = await request(app).get("/players?name=nadal");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].infos.lastName).toBe(players[0].infos.lastName)
    })
});

describe("GET /players/:id", () => {
    it("should return the player", async () => {
        const res = await request(app).get("/players/" + players[0]._id);
        expect(res.statusCode).toBe(200);
        expect(res.body.infos.lastName).toBe(players[0].infos.lastName);
    });

    it("should not find the player", async () => {
        const res = await request(app).get("/players/aaaaaaaaaaaaaaaaaaaaaaaa");
        expect(res.statusCode).toBe(404);
    })
});

describe("POST /players", () => {
    const headers = {
        'x-from': 'intapp',
        'authorization': 'Bearer ' + jwt.sign({
            login: config.CORE.MASTER_LOGIN,
            password: config.CORE.MASTER_PASSWORD,
            iat: Math.floor(Date.now() / 1000) + 3600
        }, config.CORE.JWT_SECRET, {expiresIn: config.CORE.JWT_VALIDITY})
    }
    
    it("should fail because of incorrect authentication", async () => {
        const res = await request(app).post("/players");
        expect(res.body).toBe('Unauthorized')
        expect(res.statusCode).toBe(401)
    })

    it("should fail because of incorrect request", async () => {
        const res = await request(app).post("/players").set(headers).send({});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(2)
    })

    it("should fail because of incorrect request", async () => {
        const res = await request(app).post("/players").set(headers).send({infos: {}, style: {}});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(13)
    })

    it("should create a new player", async () => {
        const res = await request(app).post("/players").set(headers).send({
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
        });
        expect(res.statusCode).toBe(201)
        expect(res.body._id).not.toBeNull()
    })
})

describe("PUT /players/:id", () => {
    const headers = {
        'x-from': 'intapp',
        'authorization': 'Bearer ' + jwt.sign({
            login: config.CORE.MASTER_LOGIN,
            password: config.CORE.MASTER_PASSWORD,
            iat: Math.floor(Date.now() / 1000) + 3600
        }, config.CORE.JWT_SECRET, {expiresIn: config.CORE.JWT_VALIDITY})
    }
    
    it("should fail because of incorrect authentication", async () => {
        const res = await request(app).put("/players/" + players[0]._id);
        expect(res.body).toBe('Unauthorized')
        expect(res.statusCode).toBe(401)
    })

    it("should fail because of incorrect request", async () => {
        const res = await request(app).put("/players/" + players[0]._id).set(headers).send({});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(2)
    })

    it("should fail because of incorrect request", async () => {
        const res = await request(app).put("/players/" + players[0]._id).set(headers).send({infos: {}, style: {}});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(13)
    })

    it("should update an existing player", async () => {
        const res = await request(app).put("/players/" + players[0]._id).set(headers).send({
            infos: {
                firstName: 'Jane',
                lastName: 'Doe',
                picture: 'test.png',
                dateOfBirth: '1988-07-22',
                country: Country.UnitedStates,
                category: PlayerCategory.WTA
            }, style: {
                mainHand: PlayerMainHand.RIGHT,
                backhand: PlayerBackhand.ONE_HANDED
            },
            proSince: 2004
        });
        expect(res.statusCode).toBe(200)
        expect(res.body._id).toBe(players[0]._id)
        expect(res.body.infos.firstName).toBe('Jane')
    })
})