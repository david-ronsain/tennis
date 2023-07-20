import { GetPlayersRequest, PlayerRequest } from 'core/requests/PlayerRequest'
import { Player } from '../src/entities/playerEntity'
import { Country, PlayerBackhand, PlayerCategory, PlayerMainHand } from 'core/enums'
import { createFilters, updatePlayer } from '../src/helpers/helper'
import { ObjectId } from 'mongodb'

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

describe('Testing the helper/createFilters', () => {
    it('should return no filters', () => {
        const request = new GetPlayersRequest()
        const filters = createFilters(request)
        expect(Object.values(filters).length).toBe(0)
    })
    it('should return an id filter', () => {
        const request = new GetPlayersRequest()
        request.exclude = '111111111111,222222222222';
        const filters = createFilters(request)
        expect(Object.values(filters).length).toBe(1)
        expect(filters).toMatchObject({_id: {$nin: request.exclude.split(',').map((id: string) => new ObjectId(id))}})
    })
    it('should return a category filter', () => {
        const request = new GetPlayersRequest()
        request.category = PlayerCategory.ATP
        const filters = createFilters(request)
        expect(Object.values(filters).length).toBe(1)
        expect(filters).toMatchObject({"infos.category": {$eq: PlayerCategory.ATP}})
    })
    it('should return a name filter', () => {
        const request = new GetPlayersRequest()
        request.name = 'Nad'
        const filters = createFilters(request)
        expect(Object.values(filters).length).toBe(1)
        expect(filters).toMatchObject({"infos.lastName": {$regex: '.*Nad.*', $options: 'i'}})
    })
    it('should return a filter for category, ids and name', () => {
        const request = new GetPlayersRequest()
        request.exclude = '111111111111,222222222222';
        request.name = 'Nad'
        request.category = PlayerCategory.ATP
        const filters = createFilters(request)
        expect(Object.values(filters).length).toBe(3)
    })
})