import { PlayerRequest } from 'core/requests/PlayerRequest'
import { Player } from '../src/entities/playerEntity'
import { Country, PlayerBackhand, PlayerCategory, PlayerMainHand } from 'core/enums'
import { updatePlayer } from '../src/helpers/helper'

describe('Testing the helper/updatePlayer', () => {
    it('should update the Player entity', () => {
        const request: PlayerRequest = {
            infos: {
                firstName: 'John',
                lastName: 'Doe',
                picture: 'test.png',
                dateOfBirth: '1988-07-22',
                country: Country.UnitedStates,
                category: PlayerCategory.ATP
            }, style: {
                mainHand: PlayerMainHand.LEFT,
                backhand: PlayerBackhand.TWO_HANDED
            },
            proSince: 2004
        }
        const player = new Player(request)

        request.proSince = 2009
        updatePlayer(player, request)

        expect(player).toMatchObject(request)
    })
})