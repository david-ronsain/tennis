import { defineStore } from 'pinia'
import axios from 'axios'
import { TournamentResponse } from 'core/responses/TournamentResponse'
import { Country, MatchType, PlayerCategory } from 'core/enums'
import type { ICalendar, IMatch } from 'core/interfaces'
import type { MatchResponse } from 'core/responses'

export const useTournamentStore = defineStore({
    id: 'store',
    state: () => ({
        tournament: undefined as TournamentResponse | undefined
    }),
    actions: {
        async loadTournament(id: string) {
            return await axios
                .get(import.meta.env.VITE_TOURNAMENT_API_URL + id)
                .then((res: { data: TournamentResponse }) => {
                    this.$patch({
                        tournament: res.data
                    })

                    return res.data
                })
        },
        async loadDraw(calendarId: string, index: number) {
            return await axios
                .get(import.meta.env.VITE_CALENDAR_API_URL + calendarId + '/draw')
                .then((res: { data: Record<MatchType, Record<PlayerCategory, any[]>> }) => {
                    this.$patch((state) => {
                        if (
                            state.tournament?.calendars?.[index] &&
                            !state.tournament?.calendars?.[index]?.draw
                        ) {
                            state.tournament.calendars[index].draw = res.data
                        }
                    })

                    return res.data
                })
        },
        refreshMatch(match: MatchResponse) {
            this.tournament?.calendars?.forEach((cal: ICalendar, i: number) => {
                if (cal.draw) {
                    const matchTypeKeys = Object.keys(cal.draw) as unknown[] as MatchType[]
                    matchTypeKeys.forEach((matchType: MatchType) => {
                        const draw = cal?.draw ?? ([] as any)
                        if (draw[matchType]) {
                            const playerCategoryKeys = Object.keys(
                                draw[matchType]
                            ) as unknown[] as PlayerCategory[]
                            playerCategoryKeys.forEach((playerCategory: PlayerCategory) => {
                                const matches = draw[matchType][playerCategory]
                                matches.forEach((m: IMatch, j: number) => {
                                    if (m._id === match._id) {
                                        draw[matchType][playerCategory][j] = match
                                        this.$patch((state) => {
                                            if (
                                                state.tournament?.calendars?.[i]?.draw?.[
                                                    matchType
                                                ]?.[playerCategory]?.[j]
                                            ) {
                                                state.tournament.calendars[i].draw = draw
                                            }
                                        })
                                    }
                                })
                            })
                        }
                    })
                }
            })
        }
    },
    getters: {
        getId: (state): string => state.tournament?._id.toString() ?? '',
        getName: (state): string => state.tournament?.name ?? '',
        getCategory: (state): string => state.tournament?.category ?? '',
        getCountry: (state): Country => state.tournament?.country ?? Country.France,
        getCalendar: (state): ICalendar[] => state.tournament?.calendars ?? ([] as ICalendar[])
    }
})
