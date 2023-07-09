import { defineStore } from 'pinia'
import axios from 'axios'
import { createHeadersWithAuth } from 'front-common'
import type { ICalendar, ITournament } from 'core/interfaces'
import type { CalendarRequest } from 'core/requests'

export const useCalendarStore = defineStore({
    id: 'calendar-store',
    state: () => ({
        startDate: '',
        endDate: '',
        tournament: undefined,
        tournaments: [] as ITournament[],
        calendars: [] as ICalendar[],
        nbResults: 10,
        nbCalendars: 0,
        page: 1,
        loading: false,
        search: ''
    }),
    actions: {
        setStartDate(startDate: string) {
            this.$patch((state) => (state.startDate = startDate))
        },
        setEndDate(endDate: string) {
            this.$patch((state) => (state.endDate = endDate))
        },
        setTournament(tournament: string) {
            this.$patch((state) => (state.tournament = tournament))
        },
        setNbResults(nb: number) {
            this.$patch((state) => (state.nbResults = nb))
        },
        setPage(page: number) {
            this.$patch((state) => (state.page = page))
        },
        setSearch(search: string) {
            this.$patch((state) => (state.search = search))
        },
        async fetchTournaments() {
            await axios
                .get(import.meta.env.VITE_TOURNAMENT_API_URL, {
                    params: {
                        skip: 0,
                        results: 1000
                    }
                })
                .then((res: { data: Tournament[] }) => {
                    this.$patch({
                        tournaments: res.data.map((tournament: ITournament) => ({
                            _id: tournament._id,
                            name: tournament.name
                        }))
                    })
                })
        },
        async fetchCalendars() {
            this.$patch({ loading: true })
            this.countCalendars()
            await axios
                .get(import.meta.env.VITE_CALENDAR_API_URL, {
                    params: {
                        skip: this.page - 1,
                        results: this.nbResults,
                        search: this.search,
                        tournament: this.tournament?.length ? this.tournament : undefined,
                        startDate: this.startDate.length
                            ? this.startDate.substring(0, 10)
                            : undefined,
                        endDate: this.endDate.length ? this.endDate.substring(0, 10) : undefined
                    }
                })
                .then((res: { data: ICalendar[] }) => {
                    this.$patch({
                        calendars: res.data,
                        loading: false
                    })
                })
        },
        async countCalendars() {
            await axios
                .get(import.meta.env.VITE_CALENDAR_API_URL + 'count', {
                    params: {
                        skip: this.page - 1,
                        results: this.nbResults,
                        search: this.search,
                        tournament: this.tournament?.length ? this.tournament : undefined,
                        startDate: this.startDate.length
                            ? this.startDate.substring(0, 10)
                            : undefined,
                        endDate: this.endDate.length ? this.endDate.substring(0, 10) : undefined
                    }
                })
                .then((res: { data: number }) => {
                    this.$patch({
                        nbCalendars: res.data
                    })
                })
        },
        async createCalendar(calendar: ICalendar): Promise<any> {
            return await axios
                .post(
                    import.meta.env.VITE_CALENDAR_API_URL,
                    {
                        startDate: calendar.startDate,
                        endDate: calendar.endDate,
                        tournament: calendar.tournament,
                        prizeMoney: Number(calendar.prizeMoney)
                    } as CalendarRequest,
                    await createHeadersWithAuth()
                )
                .then((res: any) => {
                    this.fetchCalendars()
                    return res.data
                })
                .catch((err: Error) => {
                    throw err
                })
        },
        async updateCalendar(calendar: ICalendar): Promise<any> {
            return await axios
                .put(
                    import.meta.env.VITE_CALENDAR_API_URL + calendar._id,
                    {
                        startDate: calendar.startDate,
                        endDate: calendar.endDate,
                        tournament: calendar.tournament,
                        prizeMoney: Number(calendar.prizeMoney)
                    } as CalendarRequest,
                    await createHeadersWithAuth()
                )
                .then((res: any) => {
                    this.fetchCalendars()
                    return res.data
                })
                .catch((err: Error) => {
                    throw err
                })
        },
        async draw(calendarId: string): Promise<void> {
            await axios
                .put(
                    import.meta.env.VITE_CALENDAR_API_URL + `${calendarId}/draw`,
                    {},
                    await createHeadersWithAuth()
                )
                .then((res: any) => {
                    this.fetchCalendars()
                    return res.data
                })
                .catch((err: Error) => {
                    throw err
                })
        }
    },
    getters: {
        getStartDate: (state) => state.startDate,
        getEndDate: (state) => state.endDate,
        getTournament: (state) => state.tournament,
        getCalendars: (state) => state.calendars,
        getNbResults: (state) => state.nbResults,
        getNbCalendars: (state) => state.nbCalendars,
        getPage: (state) => state.page,
        getSearch: (state) => state.search,
        getTournaments: (state) => state.tournaments,
        isLoading: (state) => state.loading
    },
    debounce: {
        fetchCalendars: 300
    }
})
