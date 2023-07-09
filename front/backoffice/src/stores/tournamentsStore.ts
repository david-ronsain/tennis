import { defineStore } from 'pinia'
import { TournamentResponse as Tournament } from 'core/responses'
import axios from 'axios'
import { createHeadersWithAuth } from 'front-common'
import type { ITournament } from 'core/interfaces'
import {
    TournamentCategoryFilter,
    type TournamentCategory,
    TournamentSurfaceFilter
} from 'core/enums'

export const useTournamentsStore = defineStore({
    id: 'tournaments-store',
    state: () => ({
        tournaments: [] as ITournament[],
        category: undefined as unknown as TournamentCategoryFilter,
        surface: undefined as unknown as TournamentSurfaceFilter,
        nbResults: 10,
        nbTournaments: 0,
        page: 1,
        loading: false,
        search: ''
    }),
    actions: {
        setNbResults(nb: number) {
            this.$patch((state) => (state.nbResults = nb))
        },
        setPage(page: number) {
            this.$patch((state) => (state.page = page))
        },
        setSearch(search: string) {
            this.$patch((state) => (state.search = search))
        },
        setCategory(category: TournamentCategory) {
            this.$patch((state) => (state.category = category))
        },
        setSurface(surface: TournamentSurfaceFilter) {
            this.$patch((state) => (state.surface = surface))
        },
        async fetchTournaments() {
            this.$patch({ loading: true })
            this.countTournaments()
            await axios
                .get(
                    import.meta.env.VITE_TOURNAMENT_API_URL +
                        `?skip=${this.page - 1}${
                            this.category === TournamentCategoryFilter.ALL || !this.category
                                ? ''
                                : '&category=' + this.category
                        }${
                            this.surface === TournamentSurfaceFilter.ALL || !this.surface
                                ? ''
                                : '&surface=' + this.surface
                        }&results=${this.nbResults}&name=${this.search ?? ''}`
                )
                .then((res: { data: Tournament[] }) => {
                    this.$patch({
                        tournaments: res.data,
                        loading: false
                    })
                })
        },
        async countTournaments() {
            await axios
                .get(
                    import.meta.env.VITE_TOURNAMENT_API_URL +
                        `count?skip=${this.page - 1}${
                            this.category === TournamentCategoryFilter.ALL || !this.category
                                ? ''
                                : '&category=' + this.category
                        }${
                            this.surface === TournamentSurfaceFilter.ALL || !this.surface
                                ? ''
                                : '&surface=' + this.surface
                        }&results=${this.nbResults}&name=${this.search ?? ''}`
                )
                .then((res: { data: number }) => {
                    this.$patch({
                        nbTournaments: res.data
                    })
                })
        },
        async createTournament(tournament: ITournament): Promise<{ success: any; error: any }> {
            return await axios
                .post(
                    import.meta.env.VITE_TOURNAMENT_API_URL,
                    {
                        name: tournament.name.trim(),
                        creationYear: Number(tournament.creationYear),
                        category: tournament.category,
                        surface: tournament.surface,
                        country: tournament.country,
                        prizeMoney: Number(tournament.prizeMoney)
                    } as ITournament,
                    await createHeadersWithAuth()
                )
                .then((res: any) => {
                    this.fetchTournaments()
                    return res.data
                })
                .catch((err: Error) => {
                    throw err
                })
        },
        async updateTournament(tournament: ITournament): Promise<{ success: any; error: any }> {
            return await axios
                .put(
                    import.meta.env.VITE_TOURNAMENT_API_URL + tournament._id,
                    {
                        name: tournament.name.trim(),
                        creationYear: Number(tournament.creationYear),
                        category: tournament.category,
                        surface: tournament.surface,
                        country: tournament.country,
                        prizeMoney: Number(tournament.prizeMoney)
                    } as ITournament,
                    await createHeadersWithAuth()
                )
                .then((res: any) => {
                    this.fetchTournaments()
                    return res.data
                })
                .catch((err: Error) => {
                    throw err
                })
        }
    },
    getters: {
        getCategory: (state) => state.category,
        getTournaments: (state) => state.tournaments,
        getNbResults: (state) => state.nbResults,
        getNbTournaments: (state) => state.nbTournaments,
        getPage: (state) => state.page,
        getSearch: (state) => state.search,
        getSurface: (state) => state.surface,
        isLoading: (state) => state.loading
    },
    debounce: {
        fetchTournaments: 300
    }
})
