import { MatchRequest } from "core/requests"
import { ObjectId } from 'mongodb'
const { MatchRound } = require('core/enums')
import { Team, Match } from '../src/entities/MatchEntity'

describe("Testing the Team consctuctor", () => {
    it('should return a Team object matching the request', async () => {
        const args = {
            player1: 'aaaaaaaaaaaaaaaaaaaaaaaa',
            player2: 'bbbbbbbbbbbbbbbbbbbbbbbb',
            number: 1
        }
        
        expect(new Team(args.number, args.player1, args.player2)).toMatchObject(args)
    })
})

describe("Testing the Match consctuctor", () => {
    it('should return a Match object matching the request', async () => {
        const args: MatchRequest = {
            team1: {
                player1: new ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
                number: 1
            },
            team2: {
                player2: new ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),
                number: 2
            },
            number: 1,
            round: MatchRound.FINAL,
            calendar: new ObjectId('cccccccccccccccccccccccc'),
            startDate: (new Date()).toISOString(),
            endDate: (new Date()).toISOString()
        }
        
        expect(new Match(args)).toMatchObject(args)
    })

    it('should return a Match object matching the request', async () => {
        const args: MatchRequest = {
            team1: {
                player1: 'aaaaaaaaaaaaaaaaaaaaaaaa',
                player2: 'cccccccccccccccccccccccc',
                number: 1
            },
            team2: {
                player1: 'bbbbbbbbbbbbbbbbbbbbbbbb',
                player2: 'dddddddddddddddddddddddd',
                number: 2
            },
            number: 1,
            round: MatchRound.FINAL,
            calendar: new ObjectId('cccccccccccccccccccccccc'),
            startDate: (new Date()).toISOString(),
            endDate: (new Date()).toISOString()
        }
        const match = new Match(args)
        
        expect(match.team1.player1).toMatchObject(new ObjectId(args.team1.player1))
        expect(match.team1.player2).toMatchObject(new ObjectId(args.team1.player2))
        expect(match.team2.player1).toMatchObject(new ObjectId(args.team2.player1))
        expect(match.team2.player2).toMatchObject(new ObjectId(args.team2.player2))
    })
})

describe('Testing the Team constructor', () => {
    it('should return a Team object', () => {
        const player1Id = new ObjectId('111111111111');
        const player2Id = new ObjectId('222222222222');
        const team = new Team(1, player1Id, player2Id);

        expect(team.number).toBe(1)
        expect(team.player1).toBe(player1Id.toString())
        expect(team.player2).toBe(player2Id.toString())
    })
})