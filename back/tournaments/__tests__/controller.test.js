const {MongoClient} = require('mongodb');
const request = require("supertest");
const app = require('../index');
const dotenv = require('dotenv');
dotenv.config();
const {config} = require('core/config/config');
const client = new MongoClient(config.CORE.DB.MONGO.TYPE + '://' + config.CORE.DB.MONGO.HOST + ':' + config.CORE.DB.MONGO.PORT);
const tournaments = require('../src/seeds/tournaments.json');
var jwt = require('jsonwebtoken');
const { TournamentCategory, TournamentSurface } = require('core/enums');

/* Connecting to the database before each test. */
beforeAll(async () => {
    await client.connect();
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').insertMany(tournaments)
    const cursor = await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').find()
    const data = await cursor.toArray()
    data.forEach(t => {
        tournaments.find(to => to.name === t.name && to.category == t.category)._id = t._id.toString()
    })
});

/* Closing database connection after each test. */
afterAll(async () => {
    await client.db(config.CORE.DB.MONGO.DB_NAME).collection('tournaments').drop()
    await client.close();
});

describe("GET /tournaments", () => {
    it("should return all tournaments", async () => {
        const res = await request(app).get("/tournaments");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(tournaments.length);
    });

    it("should return only 2 tournaments", async () => {
        const res = await request(app).get("/tournaments?results=2");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    })

    it("should return only the last tournaments", async () => {
        const res = await request(app).get("/tournaments?skip=3&results=1");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBe(tournaments[3]._id)
    })

    it("should return only the tournament Roland Garros", async () => {
        const res = await request(app).get("/tournaments?name=garros");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]._id).toBe(tournaments[1]._id)
    })
});

describe("GET /tournaments/:id", () => {
    it('should return the tournament [0]', async () => {
        const res = await request(app).get("/tournaments/" + tournaments[0]._id);
        expect(res.status).toBe(200)
        expect(res.body._id).toBe(tournaments[0]._id)
    })

    it('should fail', async () => {
        const res = await request(app).get("/tournaments/aaaaaaaaaaaaaaaaaaaaaaaa");
        expect(res.status).toBe(404)
    })
})

describe("POST /tournaments", () => {
    const headers = {
        'x-from': 'intapp',
        'authorization': 'Bearer ' + jwt.sign({
            login: config.CORE.MASTER_LOGIN,
            password: config.CORE.MASTER_PASSWORD,
            iat: Math.floor(Date.now() / 1000) + 3600
        }, config.CORE.JWT_SECRET, {expiresIn: config.CORE.JWT_VALIDITY})
    }
    
    it("should fail because of incorrect authentication", async () => {
        const res = await request(app).post("/tournaments");
        expect(res.body).toBe('Unauthorized')
        expect(res.statusCode).toBe(401)
    })

    it("should fail because of incorrect request", async () => {
        const res = await request(app).post("/tournaments").set(headers).send({});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(12)
    })

    it("should create a new tournament", async () => {
        const res = await request(app).post("/tournaments").set(headers).send({
            creationYear: 2000,
            name: 'Indoor Tournament',
            category: TournamentCategory.MASTERS,
            surface: TournamentSurface.OUTDOOR_HARD,
            prizeMoney: 1000000,
            country: 'BE'
        });
        expect(res.statusCode).toBe(201)
        expect(res.body._id).not.toBeNull()
    })
})

describe("PUT /tournaments/:id", () => {
    const headers = {
        'x-from': 'intapp',
        'authorization': 'Bearer ' + jwt.sign({
            login: config.CORE.MASTER_LOGIN,
            password: config.CORE.MASTER_PASSWORD,
            iat: Math.floor(Date.now() / 1000) + 3600
        }, config.CORE.JWT_SECRET, {expiresIn: config.CORE.JWT_VALIDITY})
    }
    
    it("should fail because of incorrect authentication", async () => {
        const tournament = await request(app).get('/tournaments?results=1&skip=3').then(res => res.body[0])
        const res = await request(app).put("/tournaments/" + tournament._id);
        expect(res.body).toBe('Unauthorized')
        expect(res.statusCode).toBe(401)
    })

    it("should fail because of incorrect request", async () => {
        const tournament = await request(app).get('/tournaments?results=1&skip=3').then(res => res.body[0])
        const res = await request(app).put("/tournaments/" + tournament._id).set(headers).send({});
        expect(res.statusCode).toBe(400)
        expect(res.body.validationFailed.length).toBe(12)
    })

    it("should update an existing tournament", async () => {
        const res = await request(app).put("/tournaments/" + tournaments[0]._id).set(headers).send({
            creationYear: 2002,
            name: 'Indoor Tournament',
            category: TournamentCategory.MASTER1000,
            surface: TournamentSurface.INDOOR_HARD,
            prizeMoney: 1000000,
            country: 'DE'
        });
        expect(res.statusCode).toBe(200)
        expect(res.body._id).toBe(tournaments[0]._id)
    })
})