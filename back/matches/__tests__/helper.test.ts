import { MatchRound, PlayerCategory } from 'core/enums'
import { IMatch } from 'core/interfaces'
import { ListMatchesRequest } from 'core/requests/MatchRequest'
import { ObjectId } from 'mongodb'
const { MatchState } = require('core/enums')
const { MatchRequest } = require('core/requests')
const { updateMatch, scorePoint, prepareFilters } = require('../src/helpers/helper')
const { EventEmitter } = require('events')
const MatchEntity = require('../src/entities/MatchEntity').Match

const emitter = new EventEmitter()
const eventCallback = jest.fn()
emitter.on('assignPlayerToNextMatch', eventCallback)

describe('Testing the helper/updateMatch', () => {
    it('shoud update the entity with the request', () => {
        const match = new MatchEntity(new MatchRequest())
        const request = new MatchRequest()
        request.startDate = (new Date()).toISOString()
        request.endDate = (new Date()).toISOString()
        request.number = 1
        request.round = MatchRound.FINAL
        request.team1 = {
            number: 1,
            player1: 'aaaaaaaaaaaaaaaaaaaaaaaa',
            player2: 'cccccccccccccccccccccccc'
        }
        request.team2 = {
            number: 2,
            player1: 'bbbbbbbbbbbbbbbbbbbbbbbb',
            player2: 'dddddddddddddddddddddddd'
        }
        request.state = MatchState.SUSPENDED

        updateMatch(match, request)

        expect(match).toMatchObject(request)
    })
})

describe('Testing the helper/scorePoint', () => {
    const player1Team1 = 'aaaaaaaaaaaaaaaaaaaaaaaa'
    const player1Team2 = 'bbbbbbbbbbbbbbbbbbbbbbbb'
    const request = new MatchRequest()
    request.number = 1
    request.round = MatchRound.SEMI
    request.team1 = {
        number: 1,
        player1: player1Team1
    }
    request.team2 = {
        number: 2,
        player1: player1Team2
    }
    let match = new MatchEntity(request)
    match._id = new ObjectId('111111111111')

    it('should not update score', () => {
        match.state = MatchState.SUSPENDED;
        scorePoint(match, player1Team1)
        expect(match.score).toBeUndefined()
    })

    it('should add a point to team1', () => {
        match = new MatchEntity(request)
        scorePoint(match, player1Team1)
        expect(match.score.points.toString()).toBe([[0, match.team1.number]].toString())
    })

    it('should add a game to team1', () => {
        resetScore(match)
        match = new MatchEntity(request)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        expect(match.score.games.toString()).toBe([[0, match.team1.number]].toString())
    })

    it('should add a set to team1', () => {
        resetScore(match)
        match.score.games = [[0, match.team1.number], [1, match.team1.number], [2, match.team1.number], [3, match.team1.number], [4, match.team1.number]]
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        expect(match.score.sets.toString()).toBe([[0, match.team1.number]].toString())
    })

    it('should update the score to 6-5 for team1', () => {
        resetScore(match)
        match.score.games = [[0, match.team1.number], [1, match.team1.number], [2, match.team1.number], [3, match.team1.number], [4, match.team1.number], [5, match.team2.number], [6, match.team2.number], [7, match.team2.number], [8, match.team2.number], [9, match.team2.number]]
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        expect(match.score.games.filter((g: [number, number][]) => g[1] === match.team1.number).length).toBe(6)
        expect(match.score.games.filter((g: [number, number][]) => g[1] === match.team2.number).length).toBe(5)
    })

    it('should update the score to 6-6', () => {
        resetScore(match)
        match.score.games = [[0, match.team1.number], [1, match.team1.number], [2, match.team1.number], [3, match.team1.number], [4, match.team1.number], [5, match.team2.number], [6, match.team2.number], [7, match.team2.number], [8, match.team2.number], [9, match.team2.number], [10, match.team2.number]]
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        expect(match.score.games.filter((g: [number, number][]) => g[1] === match.team1.number).length).toBe(6)
        expect(match.score.games.filter((g: [number, number][]) => g[1] === match.team2.number).length).toBe(6)
    })

    it('should update the score to 7-6, 7-0 in the TB', () => {
        resetScore(match)
        match.score.games = [[0, match.team1.number], [1, match.team1.number], [2, match.team1.number], [3, match.team1.number], [4, match.team1.number], [5, match.team2.number], [6, match.team2.number], [7, match.team2.number], [8, match.team2.number], [9, match.team2.number], [10, match.team2.number], [11, match.team1.number]]
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        expect(match.score.sets.filter((s: [number, number][]) => s[1] === match.team1.number).length).toBe(1)
    })

    it('should update the score to 6-6, 6-6 in the TB', () => {
        resetScore(match)
        match.score.games = [[0, match.team1.number], [1, match.team1.number], [2, match.team1.number], [3, match.team1.number], [4, match.team1.number], [5, match.team2.number], [6, match.team2.number], [7, match.team2.number], [8, match.team2.number], [9, match.team2.number], [10, match.team2.number], [11, match.team1.number]]
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team2)
        scorePoint(match, player1Team2)
        scorePoint(match, player1Team2)
        scorePoint(match, player1Team2)
        scorePoint(match, player1Team2)
        scorePoint(match, player1Team2)
        expect(match.score.games.filter((g: [number, number][]) => g[1] === match.team1.number).length).toBe(6)
        expect(match.score.games.filter((g: [number, number][]) => g[1] === match.team2.number).length).toBe(6)
        expect(match.score.points.filter((p: [number, number][]) => p[1] === match.team1.number).length).toBe(6)
        expect(match.score.points.filter((p: [number, number][]) => p[1] === match.team2.number).length).toBe(6)
    })

    it('should declare team1 winner', () => {
        resetScore(match)
        match.score.sets = [[0, match.team1.number]]
        match.score.history = [[6, 4]]
        match.score.games = [[0, match.team1.number], [1, match.team1.number], [2, match.team1.number], [3, match.team1.number], [4, match.team1.number]]
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        scorePoint(match, player1Team1)
        expect(match.team1.isWinner).toBe(true)
        expect(match.state).toBe(MatchState.FINISHED)
        expect(match.endDate).not.toBe(null)
        expect(match.endDate).not.toBe(undefined)
        expect(match.score.history.toString()).toBe([[6, 4], [6, 0]].toString())
        expect(emitter.listenerCount('assignPlayerToNextMatch')).toBe(1)
    })

    it('should declare team2 winner', () => {
        resetScore(match)
        match.score.sets = [[0, match.team2.number]]
        match.score.history = [[4, 6]]
        match.score.games = [[0, match.team2.number], [1, match.team2.number], [2, match.team2.number], [3, match.team2.number], [4, match.team2.number]]
        scorePoint(match, player1Team2)
        scorePoint(match, player1Team2)
        scorePoint(match, player1Team2)
        scorePoint(match, player1Team2)
        
        expect(match.team2.isWinner).toBe(true)
        expect(match.state).toBe(MatchState.FINISHED)
        expect(match.endDate).not.toBe(null)
        expect(match.endDate).not.toBe(undefined)
        expect(match.score.history.toString()).toBe([[4, 6], [0, 6]].toString())
        expect(emitter.listenerCount('assignPlayerToNextMatch')).toBe(1)
    })
})

describe('Testing the helper/prepareFilters', () => {
    it('shoud return the calendar filter', () => {
        const req = new ListMatchesRequest()
        req.calendar = '111111111111';
        const filters = prepareFilters(req)
        expect(filters).toMatchObject({
            $and: [{"calendar._id": {$eq: new ObjectId(req.calendar)}}]
        })
    })

    it('shoud return the startDate filter', () => {
        const req = new ListMatchesRequest()
        req.startDate = '2023-07-05';
        const filters = prepareFilters(req)
        expect(filters).toMatchObject({
            $and: [{startDate: {$gte: req.startDate}}]
        })
    })

    it('shoud return the endDate filter', () => {
        const req = new ListMatchesRequest()
        req.endDate = '2023-07-05';
        const filters = prepareFilters(req)
        expect(filters).toMatchObject({
            $and: [{startDate: {$lte: req.endDate}}]
        })
    })

    it('shoud return the state filter', () => {
        const req = new ListMatchesRequest()
        req.state = MatchState.NOT_BEGUN;
        const filters = prepareFilters(req)
        expect(filters).toMatchObject({
            $and: [{state: {$eq: MatchState.NOT_BEGUN}}]
        })
    })

    it('shoud return the name filter', () => {
        const req = new ListMatchesRequest()
        req.name = 'test';
        const filters = prepareFilters(req)
        expect(filters).toMatchObject({
            $and: [{$or: [
                {
                  'team1.player1.infos.lastName': {
                    $regex: '.*' + req.name + '.*',
                    $options: 'i'
                  }
                },
                {
                  'team1.player2.infos.lastName': {
                    $regex: '.*' + req.name + '.*',
                    $options: 'i'
                  }
                },
                {
                  'team2.player1.infos.lastName': {
                    $regex: '.*' + req.name + '.*',
                    $options: 'i'
                  }
                },
                {
                  'team2.player2.infos.lastName': {
                    $regex: '.*' + req.name + '.*',
                    $options: 'i'
                  }
                }
              ]}]
        })
    })

    it('shoud return the tournament filter', () => {
        const req = new ListMatchesRequest()
        req.tournament = '111111111111';
        const filters = prepareFilters(req)
        expect(filters).toMatchObject({
            $and: [{"tournament._id": new ObjectId(req.tournament)}]
        })
    })

    it('shoud return the category filter', () => {
        const req = new ListMatchesRequest()
        req.category = PlayerCategory.WTA;
        const filters = prepareFilters(req)
        expect(filters).toMatchObject({
            $and: [{$or: [
                {
                  'team1.player1.infos.category': { $eq: PlayerCategory.WTA }
                },
                {
                  'team2.player1.infos.category': { $eq: PlayerCategory.WTA }
                }
              ]}]
        })
    })
})

const resetScore = (match: IMatch) => {
    if (match.score) {
        match.score.points = []
        match.score.games = []
        match.score.sets = []
        match.score.history = []
        match.state = MatchState.NOT_BEGUN
    }
}