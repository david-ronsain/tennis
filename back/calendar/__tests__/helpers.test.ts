import { assignPlayersToTeams, updateCalendar, getNbMatchesForRound, drawMatches, getRounds } from '../src/helpers/helper'
import { MatchType, MatchRound, TournamentCategory } from 'core/enums'

import { CalendarRequest } from 'core/requests'
import { ObjectId } from 'mongodb'
import { Calendar } from '../src/entities/calendarEntity'
import { IPlayer } from 'core/interfaces'

describe("Testing the helper/updateCalendar", () => {
    it("The request and the Calendar object should match", () => {
        const request = new CalendarRequest();
        request.tournament = new ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa')
        request.startDate = (new Date()).toISOString()
        request.endDate = (new Date()).toISOString()
        request.prizeMoney = 12;

        const calendar = new Calendar(request)

        request.tournament = new ObjectId('aaaaaaaaaaaaaaaaaaaaaaab')
        request.prizeMoney = 15
        request.startDate = (new Date()).toISOString()
        request.endDate = (new Date()).toISOString()

        updateCalendar(calendar, request)

        expect(calendar).toMatchObject(request);
    })
})

describe('Testing the helper/assignPlayersToTeams', () => {
    const players = [
        {
            _id: new ObjectId('111111111111111111111111'),
            infos: {},
            style: {}
        } as IPlayer, {
            _id: new ObjectId('222222222222222222222222'),
            infos: {},
            style: {}
        } as IPlayer, {
            _id: new ObjectId('333333333333333333333333'),
            infos: {},
            style: {}
        } as IPlayer, {
            _id: new ObjectId('444444444444444444444444'),
            infos: {},
            style: {}
        } as IPlayer
    ]
    it('should return empty teams', () => {
        const teams = assignPlayersToTeams(MatchType.SINGLES, [])
        expect(teams.team1.player1).toBe(undefined)
        expect(teams.team1.player2).toBe(undefined)
        expect(teams.team2.player1).toBe(undefined)
        expect(teams.team2.player2).toBe(undefined)
    })

    it('shoud return correct teams for a singles match', () => {
        const teams = assignPlayersToTeams(MatchType.SINGLES, [players[0], players[1]])
        expect(teams.team1.player1).toBe(players[0]._id.toString())
        expect(teams.team1.player2).toBe(undefined)
        expect(teams.team2.player1).toBe(players[1]._id.toString())
        expect(teams.team2.player2).toBe(undefined)
    })

    it('shoud return correct teams for a doubles match', () => {
        const teams = assignPlayersToTeams(MatchType.DOUBLES, [players[0], players[1], players[2], players[3]])
        expect(teams.team1.player1).toBe(players[0]._id.toString())
        expect(teams.team1.player2).toBe(players[1]._id.toString())
        expect(teams.team2.player1).toBe(players[2]._id.toString())
        expect(teams.team2.player2).toBe(players[3]._id.toString())
    })
})

describe('Testing the helper/getNbMatchesForRound', () => {
    it('should return 1 for the final', () => {
        expect(getNbMatchesForRound(MatchRound.FINAL)).toBe(1)
    })

    it('should return 2 for the semi', () => {
        expect(getNbMatchesForRound(MatchRound.SEMI)).toBe(2)
    })

    it('should return 4 for the quarter', () => {
        expect(getNbMatchesForRound(MatchRound.QUARTER)).toBe(4)
    })

    it('should return 8 for the eighth', () => {
        expect(getNbMatchesForRound(MatchRound.EIGHTH)).toBe(8)
    })
    
    it('should return 16 for the R3', () => {
        expect(getNbMatchesForRound(MatchRound.R3)).toBe(16)
    })
    
    it('should return 32 for the R2', () => {
        expect(getNbMatchesForRound(MatchRound.R2)).toBe(32)
    })
    
    it('should return 64 for the R1', () => {
        expect(getNbMatchesForRound(MatchRound.R1)).toBe(64)
    })
})

describe('Testing the helper/getRounds', () => {
    it('should return semi and final', () => {
        const rounds = getRounds(TournamentCategory.MASTERS)
        expect(rounds.toString()).toBe([MatchRound.SEMI, MatchRound.FINAL].toString())
    })

    it('should return R1, R2, R3, eighth, quarter, semi and final', () => {
        let rounds = getRounds(TournamentCategory.MASTER1000)
        expect(rounds.toString()).toBe([MatchRound.R1, MatchRound.R2, MatchRound.R3, MatchRound.EIGHTH, MatchRound.QUARTER, MatchRound.SEMI, MatchRound.FINAL].toString())

        rounds = getRounds(TournamentCategory.GRAND_SLAM)
        expect(rounds.toString()).toBe([MatchRound.R1, MatchRound.R2, MatchRound.R3, MatchRound.EIGHTH, MatchRound.QUARTER, MatchRound.SEMI, MatchRound.FINAL].toString())
    })

    it('should return R3, eighth, quarter, semi and final', () => {
        let rounds = getRounds(TournamentCategory.T250)
        expect(rounds.toString()).toBe([MatchRound.R3, MatchRound.EIGHTH, MatchRound.QUARTER, MatchRound.SEMI, MatchRound.FINAL].toString())
    })
})

describe('Testing the helper/drawMatches', () => {
    it('should draw the matches', async() => {
        let draw = await drawMatches(TournamentCategory.MASTERS, 'aaaaaaaaaaaaaaaaaaaaaaaa')
        expect(draw.SINGLES.ATP.length).toBe(3)
        expect(draw.SINGLES.WTA.length).toBe(3)
        expect(draw.DOUBLES.ATP.length).toBe(3)
        expect(draw.DOUBLES.WTA.length).toBe(3)

        draw = await drawMatches(TournamentCategory.GRAND_SLAM, 'aaaaaaaaaaaaaaaaaaaaaaaa')
        expect(draw.SINGLES.ATP.length).toBe(127)
        expect(draw.SINGLES.WTA.length).toBe(127)
        expect(draw.DOUBLES.ATP.length).toBe(127)
        expect(draw.DOUBLES.WTA.length).toBe(127)

        draw = await drawMatches(TournamentCategory.T250, 'aaaaaaaaaaaaaaaaaaaaaaaa')
        expect(draw.SINGLES.ATP.length).toBe(31)
        expect(draw.SINGLES.WTA.length).toBe(31)
        expect(draw.DOUBLES.ATP.length).toBe(31)
        expect(draw.DOUBLES.WTA.length).toBe(31)
    })
})