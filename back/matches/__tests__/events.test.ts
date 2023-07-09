const { TournamentCategory, Country, TournamentSurface, MatchRound } = require('core/enums')
const { drawMatches } = require('back-calendar/src/helpers/helper')
import { ICalendar, ITournament } from 'core/interfaces'
import { Match } from '../src/entities/MatchEntity'
const { MatchRequest } = require('core/requests')
const { assignPlayerToNextMatchCallback } = require('../src/subscribers')
import { IAssignPlayerEvent } from 'core/events'
import { ObjectId } from 'mongodb'

describe('testing assignPlayerToNextMatchEvent', () => {
    const tournament: ITournament = {
        _id: new ObjectId(),
        creationYear: 2012,
        name: 'Test GC',
        category: TournamentCategory.GRAND_SLAM,
        prizeMoney: 12,
        country: Country.France,
        surface: TournamentSurface.CLAY
    }

    const calendar: ICalendar = {
        _id: new ObjectId(),
        startDate: '2023-04-01',
        endDate: '2023-04-16',
        prizeMoney: 20,
        tournament: tournament._id,
    }

    const player1Id = new ObjectId()
    const player2Id = new ObjectId()

    const assignPlayer1Request: IAssignPlayerEvent = {
        _id: (new ObjectId()).toString(),
        team: {
            player1: player1Id.toString(),
            number: 1
        },
        tournament: tournament,
        calendar: calendar,
        number: 0,
        round: MatchRound.Q1
    }
    const assignPlayer2Request: IAssignPlayerEvent = {
        _id: (new ObjectId()).toString(),
        team: {
            player1: player2Id.toString(),
            number: 2
        },
        tournament: tournament,
        calendar: calendar,
        number: 0,
        round: MatchRound.Q1
    }

    it('should affect player 1 on 1st semi in team 1', async () => {
        calendar.draw = await drawMatches(TournamentCategory.GRAND_SLAM, true)
        const matches = createMatches(calendar?.draw?.SINGLES?.ATP ? calendar?.draw?.SINGLES?.ATP as ObjectId[] : [])

        matches[0].team1.player1 = player1Id.toString()
        matches[0].team2.player1 = player2Id.toString()

        assignPlayer1Request._id = matches[0]._id?.toString() ?? ''
        assignPlayer1Request.number = matches[0].number
        assignPlayer1Request.round = matches[0].round

        const res = await assignPlayerToNextMatchCallback(assignPlayer1Request, true)
        expect(res.position).toBe(5)
        expect(res.team.number).toBe(1)
    })

    it('should affect player 2 on 1st semi in team 1', async () => {
        calendar.draw = await drawMatches(TournamentCategory.GRAND_SLAM, true)
        const matches = createMatches(calendar?.draw?.SINGLES?.ATP ? calendar?.draw?.SINGLES?.ATP as ObjectId[] : [])
        matches[0].team1.player1 = player1Id.toString()
        matches[0].team2.player1 = player2Id.toString()

        assignPlayer2Request._id = matches[0]._id?.toString() ?? ''
        assignPlayer2Request.number = matches[0].number
        assignPlayer2Request.round = matches[0].round

        const res = await assignPlayerToNextMatchCallback(assignPlayer2Request, true)
        expect(res.position).toBe(5)
        expect(res.team.number).toBe(1)
    })

    it('should affect player 1 on 1st semi in team 2', async () => {
        calendar.draw = await drawMatches(TournamentCategory.GRAND_SLAM, true)
        const matches = createMatches(calendar?.draw?.SINGLES?.ATP ? calendar?.draw?.SINGLES?.ATP as ObjectId[] : [])
        matches[1].team1.player1 = player1Id.toString()
        matches[1].team2.player1 = player2Id.toString()

        assignPlayer1Request._id = matches[1]._id?.toString() ?? ''
        assignPlayer1Request.number = matches[1].number
        assignPlayer1Request.round = matches[1].round

        const res = await assignPlayerToNextMatchCallback(assignPlayer1Request, true)
        expect(res.position).toBe(5)
        expect(res.team.number).toBe(2)
    })

    it('should affect player 2 on 1st semi in team 2', async () => {
        calendar.draw = await drawMatches(TournamentCategory.GRAND_SLAM, true)
        const matches = createMatches(calendar?.draw?.SINGLES?.ATP ? calendar?.draw?.SINGLES?.ATP as ObjectId[] : [])
        matches[1].team1.player1 = player1Id.toString()
        matches[1].team2.player1 = player2Id.toString()

        assignPlayer2Request._id = matches[1]._id?.toString() ?? ''
        assignPlayer2Request.number = matches[1].number
        assignPlayer2Request.round = matches[1].round

        const res = await assignPlayerToNextMatchCallback(assignPlayer2Request, true)
        expect(res.position).toBe(5)
        expect(res.team.number).toBe(2)
    })

    it('should affect player 1 on 2nd semi in team 1', async () => {
        calendar.draw = await drawMatches(TournamentCategory.GRAND_SLAM, true)
        const matches = createMatches(calendar?.draw?.SINGLES?.ATP ? calendar?.draw?.SINGLES?.ATP as ObjectId[] : [])
        matches[2].team1.player1 = player1Id.toString()
        matches[2].team2.player1 = player2Id.toString()

        assignPlayer1Request._id = matches[2]._id?.toString() ?? ''
        assignPlayer1Request.number = matches[2].number
        assignPlayer1Request.round = matches[2].round

        const res = await assignPlayerToNextMatchCallback(assignPlayer1Request, true)
        expect(res.position).toBe(6)
        expect(res.team.number).toBe(1)
    })

    it('should affect player 2 on 2nd semi in team 1', async () => {
        calendar.draw = await drawMatches(TournamentCategory.GRAND_SLAM, true)
        const matches = createMatches(calendar?.draw?.SINGLES?.ATP ? calendar?.draw?.SINGLES?.ATP as ObjectId[] : [])
        matches[2].team1.player1 = player1Id.toString()
        matches[2].team2.player1 = player2Id.toString()

        assignPlayer2Request._id = matches[2]._id?.toString() ?? ''
        assignPlayer2Request.number = matches[2].number
        assignPlayer2Request.round = matches[2].round

        const res = await assignPlayerToNextMatchCallback(assignPlayer2Request, true)
        expect(res.position).toBe(6)
        expect(res.team.number).toBe(1)
    })

    it('should affect player 1 on final 1st team and player 2 on final 2nd team', async () => {
        calendar.draw = await drawMatches(TournamentCategory.GRAND_SLAM, true)
        const matches = createMatches(calendar?.draw?.SINGLES?.ATP ? calendar?.draw?.SINGLES?.ATP as ObjectId[] : [])
        matches[4].team1.player1 = player1Id.toString()
        matches[4].team2.player1 = player2Id.toString()

        assignPlayer1Request._id = matches[4]._id?.toString() ?? ''
        assignPlayer1Request.number = matches[4].number
        assignPlayer1Request.round = matches[4].round
        
        const res = await assignPlayerToNextMatchCallback(assignPlayer1Request, true)
        expect(res.position).toBe(7)
        expect(res.team.number).toBe(1)
        
        matches[5].team1.player1 = player1Id.toString()
        matches[5].team2.player1 = player2Id.toString()

        assignPlayer2Request._id = matches[5]._id?.toString() ?? ''
        assignPlayer2Request.number = matches[5].number
        assignPlayer2Request.round = matches[5].round

        const res2 = await assignPlayerToNextMatchCallback(assignPlayer2Request, true)
        expect(res2.position).toBe(7)
        expect(res2.team.number).toBe(2)
    })
})

const createMatches = (matchIds: ObjectId[]): Match[] => {
    const matches: Match[] = []
    matchIds.forEach((matchId: ObjectId, index: number) => {
        let round = index < 4 ? MatchRound.QUARTER : (index < 6 ? MatchRound.SEMI : MatchRound.FINAL)
        const request = new MatchRequest()
        request.team1 = {
            number: 1
        }
        request.team2 = {
            number: 2
        }
        request.round = round
        request.number = index + 1
        const match = new Match(request)
        match._id = matchId
        matches.push(match)
    })

    return matches
}