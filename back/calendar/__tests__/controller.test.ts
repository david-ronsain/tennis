import { MongoClient, ObjectId } from 'mongodb'
import request from 'supertest';
const app = require('../index');
const dotenv = require('dotenv');
dotenv.config();
const config = require('core/config/config').config;
const client = new MongoClient(config.CORE.DB.MONGO.TYPE + '://' + config.CORE.DB.MONGO.HOST + ':' + config.CORE.DB.MONGO.PORT, {monitorCommands: true});
const calendar = require('../src/seeds/calendar.json');
const tournaments = require('back-tournaments/dist/src/seeds/tournaments.json');
const jwt = require('jsonwebtoken');
import { ICalendar, ITournament } from 'core/interfaces'

/* Connecting to the database before each test. */
beforeAll(async () => {
    await client.connect();
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').insertMany(tournaments)
    let cursor = client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').find()
    let data = await cursor.toArray()
    JSON.parse(JSON.stringify(data)).forEach((t: ITournament, index: number) => {
        calendar[index].prizeMoney = t.prizeMoney
        calendar[index].tournament = new ObjectId(t._id)
    })
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('calendar').insertMany(calendar)
    cursor = client.db(config.CORE.DB.MONGO.DB_NAME).collection('calendar').find()
    data = await cursor.toArray()
    JSON.parse(JSON.stringify(data)).forEach((c: ICalendar, index: number) => {
        calendar[index]._id = new ObjectId(c._id)
    })
});

/* Closing database connection after each test. */
afterAll(async () => {
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').drop()
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('calendar').drop()
    await client.close();
});

describe("GET /calendar", () => {
    it("should return all tournaments between two dates", async () => {
        const res = await request(app).get("/calendar?startDate=2023-01-01&endDate=2023-12-31");
        //console.log(res)
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(calendar.length);
    });

    it("should return only the OA", async () => {
        const res = await request(app).get("/calendar?startDate=2023-01-01&endDate=2023-01-30");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBe(calendar[2]._id.toString())
    })

    it("should return only the RG", async () => {
        const res = await request(app).get("/calendar?startDate=2023-05-01&endDate=2023-05-30");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBe(calendar[1]._id.toString())
    })

    it("should return only the Wimbledon", async () => {
        const res = await request(app).get("/calendar?startDate=2023-07-05&endDate=2023-07-30");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBe(calendar[0]._id.toString())
    })

    it("should return only the US Open", async () => {
        const res = await request(app).get("/calendar?startDate=2023-09-01&endDate=2023-09-02");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBe(calendar[3]._id.toString())
    })

    it("should return only the OA and RG", async () => {
        const res = await request(app).get("/calendar?startDate=2023-01-01&endDate=2023-05-30");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body.map((cal: {_id: string}) => cal._id).indexOf(calendar[2]._id.toString())).not.toBe(-1)
        expect(res.body.map((cal: {_id: string}) => cal._id).indexOf(calendar[1]._id.toString())).not.toBe(-1)
    })
});

describe('GET /calendar/match/:id', () => {
    it('should return wimbledon', async () => {
        const res = await request(app).get("/calendar/match/" + calendar[0].draw.SINGLES.ATP[0]);
        expect(res.statusCode).toBe(200);
        expect(res.body._id.toString()).toBe(calendar[0]._id.toString())
    })
    
    it('should return RG', async () => {
        const res = await request(app).get("/calendar/match/" + calendar[1].draw.SINGLES.WTA[0]);
        expect(res.statusCode).toBe(200);
        expect(res.body._id.toString()).toBe(calendar[1]._id.toString())
    })

    it('should return OA', async () => {
        const res = await request(app).get("/calendar/match/" + calendar[2].draw.DOUBLES.ATP[0]);
        expect(res.statusCode).toBe(200);
        expect(res.body._id.toString()).toBe(calendar[2]._id.toString())
    })

    it('should return US open', async () => {
        const res = await request(app).get("/calendar/match/" + calendar[3].draw.DOUBLES.WTA[0]);
        expect(res.statusCode).toBe(200);
        expect(res.body._id.toString()).toBe(calendar[3]._id.toString())
    })
})

describe("POST /calendar", () => {
    const headers = {
        'x-from': 'intapp',
        'authorization': 'Bearer ' + jwt.sign({
            login: config.CORE.MASTER_LOGIN,
            password: config.CORE.MASTER_PASSWORD,
            iat: Math.floor(Date.now() / 1000) + 3600
        }, config.CORE.JWT_SECRET, {expiresIn: config.CORE.JWT_VALIDITY})
    }
    
    it("should fail because of incorrect authentication", async () => {
        const res = await request(app).post("/calendar");
        expect(res.body).toBe('Unauthorized')
        expect(res.statusCode).toBe(401)
    })

    it("should fail because of incorrect request", async () => {
        const res = await request(app).post("/calendar").set(headers).send({});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(10)
    })

    it("should create a new tournament", async () => {
        const res = await request(app).post("/calendar").set(headers).send({
            startDate: '2023-10-01',
            endDate: '2023-10-15',
            prizeMoney: 69000000,
            tournament: tournaments[0]._id
        });
        expect(res.statusCode).toBe(201)
        expect(res.body._id).not.toBeNull()
    })
})

describe("PUT /calendar", () => {
    const headers = {
        'x-from': 'intapp',
        'authorization': 'Bearer ' + jwt.sign({
            login: config.CORE.MASTER_LOGIN,
            password: config.CORE.MASTER_PASSWORD,
            iat: Math.floor(Date.now() / 1000) + 3600
        }, config.CORE.JWT_SECRET, {expiresIn: config.CORE.JWT_VALIDITY})
    }
    
    it("should fail because of incorrect authentication", async () => {
        const res = await request(app).put("/calendar/" + calendar[0]._id.toString());
        expect(res.body).toBe('Unauthorized')
        expect(res.statusCode).toBe(401)
    })

    it("should fail because of incorrect request", async () => {
        const res = await request(app).put("/calendar/" + calendar[0]._id.toString()).set(headers).send({});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(10)
    })

    it("should update an existing tournament", async () => {
        const res = await request(app).put("/calendar/" + calendar[0]._id.toString()).set(headers).send({
            tournament: tournaments[0]._id,
            startDate: '2023-10-01',
            endDate: '2023-10-15',
            prizeMoney: 69000000,
        });
        expect(res.statusCode).toBe(200)
        expect(res.body.tournament).toBe(tournaments[0]._id.toString())
    })
})