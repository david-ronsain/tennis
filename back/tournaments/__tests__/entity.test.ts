import { Country } from 'core/enums/Country'
import { TournamentCategory } from 'core/enums/TournamentCategory'
import { TournamentSurface } from 'core/enums/TournamentSurface'
import { TournamentRequest } from 'core/requests/TournamentRequest'
import { Tournament } from '../src/entities/tournamentEntity'

describe('Testing the entity', () => {
    it('Testing the entity constructor', () => {
        const req = new TournamentRequest()
        req.category = TournamentCategory.CHALLENGER125
        req.country = Country.Afghanistan
        req.creationYear = 1990
        req.name = 'Test'
        req.prizeMoney = 123456789
        req.surface = TournamentSurface.CLAY
        const tournament = new Tournament(req);

        expect(tournament).toMatchObject(req)
    })
})