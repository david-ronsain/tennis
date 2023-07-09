import { MatchRound } from 'core/enums'
import { IMatch } from 'core/interfaces'
const { MatchState } = require('core/enums')
const { MatchRequest } = require('core/requests')
const { updateMatch, scorePoint } = require('../src/helpers/helper')
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
            player1: 'aaaaaaaaaaaaaaaaaaaaaaaa'
        }
        request.team2 = {
            number: 2,
            player1: 'bbbbbbbbbbbbbbbbbbbbbbbb'
        }

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

    it('should add a point to team1', () => {
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
})

const resetScore = (match: IMatch) => {
    if (match.score) {
        match.score.points = []
        match.score.games = []
        match.score.sets = []
        match.score.history = []
    }
}