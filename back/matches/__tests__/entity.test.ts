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
})