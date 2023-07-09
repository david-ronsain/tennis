import { CalendarRequest } from 'core/requests'
import { ObjectId } from 'mongodb'
import { Calendar } from '../src/entities/calendarEntity'

describe("testing the Calendar entities", () => {
    it('the request should match the calendar object', async () => {
        const request = new CalendarRequest();
        request.tournament = new ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa')
        request.startDate = (new Date()).toISOString()
        request.endDate = (new Date()).toISOString()
        request.prizeMoney = 12;

        const calendar = new Calendar(request)
        expect(calendar).toMatchObject(request);
    })
})