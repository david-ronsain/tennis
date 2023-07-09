import { defineStore } from 'pinia'
import { MatchState, MatchTypeFilters, PlayerCategoryFilter } from 'core/enums'
import { MatchResponse } from 'core/responses'
import axios from 'axios'
import type { PlayerRequest } from 'core/requests'
import { createHeadersWithAuth } from 'front-common'
import type { ITournament } from 'core/interfaces'

export const useMatchesStore = defineStore({
    id: 'matches-store',
    state: () => ({
        tournament: undefined as unknown as string,
        matchType: MatchTypeFilters.ALL,
        category: PlayerCategoryFilter.ALL,
        startDate: '',
        endDate: '',
        tournaments: [] as ITournament[],
        matches: [] as MatchResponse[],
        nbResults: 10,
        nbMatches: 0,
        page: 1,
        loading: false,
        search: ''
    }),
    actions: {
        setTournament(tournament: string) {
            this.$patch((state) => (state.tournament = tournament))
        },
        setCategory(cat: PlayerCategoryFilter) {
            this.$patch((state) => (state.category = cat))
        },
        setStartDate(date: string) {
            this.$patch((state) => (state.startDate = date))
        },
        setEndDate(date: string) {
            this.$patch((state) => (state.endDate = date))
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
        async fetchMatches() {
            this.$patch({ loading: true })
            this.countMatches()
            await axios
                .get(import.meta.env.VITE_MATCHES_API_URL, {
                    params: {
                        skip: this.page - 1,
                        results: Number(this.nbResults),
                        name: this.search?.length ? this.search.toString() : undefined,
                        category:
                            this.category.length && this.category !== PlayerCategoryFilter.ALL
                                ? this.category
                                : undefined,
                        tournament: this.tournament?.length ? this.tournament : undefined,
                        startDate: this.startDate?.length ? this.startDate : undefined,
                        endDate: this.endDate?.length ? this.endDate : undefined
                    }
                })
                .then((res: { data: MatchResponse[] }) => {
                    this.$patch({
                        matches: res.data,
                        loading: false
                    })
                })
        },
        async countMatches() {
            await axios
                .get(import.meta.env.VITE_MATCHES_API_URL + 'count', {
                    params: {
                        skip: this.page - 1,
                        results: Number(this.nbResults),
                        name: this.search?.length ? this.search.toString() : undefined,
                        category:
                            this.category.length && this.category !== PlayerCategoryFilter.ALL
                                ? this.category
                                : undefined,
                        tournament: this.tournament?.length ? this.tournament : undefined,
                        startDate: this.startDate?.length ? this.startDate : undefined,
                        endDate: this.endDate?.length ? this.endDate : undefined
                    }
                })
                .then((res: { data: number }) => {
                    this.$patch({
                        nbMatches: res.data
                    })
                })
        },
        async updateState(id: string, state: MatchState): Promise<any> {
            const match = this.matches.find((m: MatchResponse) => m._id.toString() === id)
            return await axios
                .put(
                    import.meta.env.VITE_MATCHES_API_URL + id,
                    {
                        ...Object.assign(match, {
                            state,
                            team1: Object.assign(match.team1, {
                                player1: match.team1.player1._id,
                                player2: match.team1.player2?._id ?? undefined
                            }),
                            team2: Object.assign(match.team2, {
                                player1: match.team2.player1._id,
                                player2: match.team2.player2?._id ?? undefined
                            })
                        })
                    } as PlayerRequest,
                    await createHeadersWithAuth()
                )
                .then((res: any) => {
                    this.fetchMatches()
                    return res.data
                })
                .catch((err: Error) => {
                    throw err
                })
        }
    },
    getters: {
        getCategory: (state) => state.category,
        getTournament: (state) => state.tournament,
        getStartDate: (state) => state.startDate,
        getEndDate: (state) => state.endDate,
        getMatches: (state) => state.matches,
        getNbResults: (state) => state.nbResults,
        getNbMatches: (state) => state.nbMatches,
        getPage: (state) => state.page,
        getSearch: (state) => state.search,
        getTournaments: (state) => state.tournaments,
        isLoading: (state) => state.loading
    },
    debounce: {
        fetchMatches: 300
    }
})
