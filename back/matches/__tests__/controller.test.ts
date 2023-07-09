import { IMatch, IPlayer } from "core/interfaces";

const MongoClient = require('mongodb').MongoClient;
const request = require("supertest");
const { app } = require('../index');
const dotenv = require('dotenv');
dotenv.config();
const config = require('core/config/config').config;
const client = new MongoClient(config.CORE.DB.MONGO.TYPE + '://' + config.CORE.DB.MONGO.HOST + ':' + config.CORE.DB.MONGO.PORT, {monitorCommands: true});
const matches = require('../src/seeds/matches.json');
const players = require('back-players/dist/src/seeds/players.json');
const jwt = require('jsonwebtoken');
const { MatchRound } = require('core/enums/MatchRound');

/* Connecting to the database before each test. */
beforeAll(async () => {
    await client.connect();
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').insertMany(players)
    const cursorPlayers = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('players').find();
    (await cursorPlayers.toArray()).forEach((row: IPlayer) => {
        players.find((e: IPlayer) => e.infos.lastName === row.infos.lastName)._id = row._id.toString()
    })
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
    await client.close();
});

describe("POST /matches", () => {
    const headers = {
        'x-from': 'intapp',
        'authorization': 'Bearer ' + jwt.sign({
            login: config.CORE.MASTER_LOGIN,
            password: config.CORE.MASTER_PASSWORD,
            iat: Math.floor(Date.now() / 1000) + 3600
        }, config.CORE.JWT_SECRET, {expiresIn: config.CORE.JWT_VALIDITY})
    }
    
    it("should fail because of incorrect authentication", async () => {
        const res = await request(app).post("/matches");
        expect(res.body).toBe('Unauthorized')
        expect(res.statusCode).toBe(401)
    })

    it("should fail because of incorrect request", async () => {
        const res = await request(app).post("/matches").set(headers).send({});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(10)
    })

    it("should create a new match", async () => {
        const res = await request(app).post("/matches").set(headers).send({
            team1: {
                player1: players[0]._id,
                number: 1
            },
            team2: {
                player1: players[1]._id,
                number: 2
            },
            round: MatchRound.FINAL,
            number: 1,
            calendar: 'aaaaaaaaaaaaaaaaaaaaaaaa'
        });
        expect(res.statusCode).toBe(201)
        expect(res.body.team1.player1).toBe(players[0]._id)
        expect(res.body.team2.player1).toBe(players[1]._id)
    })
})

describe("PUT /matches", () => {
    const headers = {
        'x-from': 'intapp',
        'authorization': 'Bearer ' + jwt.sign({
            login: config.CORE.MASTER_LOGIN,
            password: config.CORE.MASTER_PASSWORD,
            iat: Math.floor(Date.now() / 1000) + 3600
        }, config.CORE.JWT_SECRET, {expiresIn: config.CORE.JWT_VALIDITY})
    }
    
    it("should fail because of incorrect authentication", async () => {
        const res = await request(app).put("/matches/" + matches[0]._id);
        expect(res.body).toBe('Unauthorized')
        expect(res.statusCode).toBe(401)
    })

    it("should fail because of incorrect request", async () => {
        const res = await request(app).put("/matches/" + matches[0]._id).set(headers).send({});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(10)
    })

    it("should update an existing match", async () => {
        const res = await request(app).put("/matches/" + matches[0]._id).set(headers).send({
            team1: {
                number: 1,
                player1: players[0]._id
            },
            team2: {
                number: 2,
                player1: players[1]._id
            },
            round: matches[0].round,
            number: matches[0].number,
            calendar: 'aaaaaaaaaaaaaaaaaaaaaaaa'
        });
        
        expect(res.statusCode).toBe(200)
        expect(res.body.team1.player1).toBe(players[0]._id)
        expect(res.body.team2.player1).toBe(players[1]._id)
    })
})