const { Country } = require('core/enums/Country');
const { PlayerBackhand, PlayerCategory, PlayerMainHand } = require('core/enums');
const { PlayerRequest } = require('core/requests')
const { Player } = require('../src/entities/playerEntity')

describe('Testing the Player entity', () => {
    it('shoud create a player based on the request', () => {
        const request = new PlayerRequest();
        request.infos = {
            category: PlayerCategory.ATP,
            country: Country.Spain,
            dateOfBirth: '1986-06-03',
            firstName: 'Rafael',
            lastName: 'Nadal',
            picture: 'https://cdn.tennistemple.com/images/upload/player/Rafael_Nadal_100.jpg'
        }
        request.style = {
            backhand: PlayerBackhand.TWO_HANDED,
            mainHand: PlayerMainHand.LEFT
        }
        request.proSince = 2003

        expect(new Player(request)).toMatchObject(request)
    })
})