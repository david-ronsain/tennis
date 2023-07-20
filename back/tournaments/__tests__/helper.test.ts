import { GetTournamentsRequest, TournamentRequest } from 'core/requests'
import { Tournament } from '../src/entities/tournamentEntity'
import { Country, TournamentCategory, TournamentSurface } from 'core/enums';
import { prepareFilters, updateTournament } from '../src/helpers/helper'

describe('Testing the helper/updateTournament', () => {
    it('should update the tournament', () => {
        const tournament = new Tournament(new TournamentRequest());
        const request = new TournamentRequest();
        request.category = TournamentCategory.GRAND_SLAM;
        request.country = Country.France;
        request.creationYear = 2020;
        request.name = 'RG';
        request.surface = TournamentSurface.CLAY;
        request.prizeMoney = 12000000;
        updateTournament(tournament, request);
        expect(tournament).toMatchObject(request);
    })
})

describe('Testing the helper/prepareFilters', () => {
    it('should returns the filters', () => {
        const req = new GetTournamentsRequest()
        req.category = TournamentCategory.GRAND_SLAM
        req.name = 'RG'
        req.surface = TournamentSurface.CLAY
        const filters = prepareFilters(req)
        expect(filters).toMatchObject({
            $and: [
                {name: { $regex: '.*' + req.name + '.*', $options: 'i' }},
                {category: { $eq: req.category }},
                {surface: { $eq: req.surface }}
            ]
        })
    })
})