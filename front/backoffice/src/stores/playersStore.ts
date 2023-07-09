import { defineStore } from 'pinia'
import { PlayerCategoryFilter } from 'core/enums'
import { PlayerResponse as Player, PlayerResponse } from 'core/responses'
import axios from 'axios'
import { createHeadersWithAuth } from 'front-common'
import type { IPlayer } from 'core/interfaces'

export const usePlayersStore = defineStore({
    id: 'players-store',
    state: () => ({
        category: PlayerCategoryFilter.ALL,
        players: [] as Player[],
        nbResults: 10,
        nbPlayers: 0,
        page: 1,
        loading: false,
        search: ''
    }),
    actions: {
        setCategory(category: PlayerCategoryFilter) {
            this.$patch((state) => (state.category = category))
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
        async fetchPlayers() {
            this.$patch({ loading: true })
            this.countPlayers()
            await axios
                .get(
                    import.meta.env.VITE_PLAYERS_API_URL +
                        `?skip=${this.page - 1}${
                            this.category === PlayerCategoryFilter.ALL
                                ? ''
                                : '&category=' + this.category
                        }&results=${this.nbResults}&name=${this.search ?? ''}`
                )
                .then((res: { data: PlayerResponse[] }) => {
                    this.$patch({
                        players: res.data,
                        loading: false
                    })
                })
        },
        async countPlayers() {
            await axios
                .patch(
                    import.meta.env.VITE_PLAYERS_API_URL +
                        `count?skip=${this.page - 1}${
                            this.category === PlayerCategoryFilter.ALL
                                ? ''
                                : '&category=' + this.category
                        }&results=${this.nbResults}&name=${this.search ?? ''}`
                )
                .then((res: { data: number }) => {
                    this.$patch({
                        nbPlayers: res.data
                    })
                })
        },
        async createPlayer(player: IPlayer): Promise<{ success: any; error: any }> {
            return await axios
                .post(
                    import.meta.env.VITE_PLAYERS_API_URL,
                    {
                        infos: {
                            category: player.infos.category,
                            country: player.infos.country,
                            dateOfBirth: player.infos.dateOfBirth,
                            firstName: player.infos.firstName.trim(),
                            lastName: player.infos.lastName.trim(),
                            picture: player.infos.picture.trim()
                        },
                        style: {
                            backhand: player.style.backhand,
                            mainHand: player.style.mainHand
                        },
                        proSince: Number(player.proSince)
                    } as IPlayer,
                    await createHeadersWithAuth()
                )
                .then((res: any) => {
                    this.fetchPlayers()
                    return res.data
                })
                .catch((err: Error) => {
                    throw err
                })
        },
        async updatePlayer(player: IPlayer): Promise<{ success: any; error: any }> {
            return await axios
                .put(
                    import.meta.env.VITE_PLAYERS_API_URL + player._id,
                    {
                        infos: {
                            category: player.infos.category,
                            country: player.infos.country,
                            dateOfBirth: player.infos.dateOfBirth,
                            firstName: player.infos.firstName.trim(),
                            lastName: player.infos.lastName.trim(),
                            picture: player.infos.picture.trim()
                        },
                        style: {
                            backhand: player.style.backhand,
                            mainHand: player.style.mainHand
                        },
                        proSince: Number(player.proSince)
                    } as IPlayer,
                    await createHeadersWithAuth()
                )
                .then((res: any) => {
                    this.fetchPlayers()
                    return res.data
                })
                .catch((err: Error) => {
                    throw err
                })
        }
    },
    getters: {
        getCategory: (state) => state.category,
        getPlayers: (state) => state.players,
        getNbResults: (state) => state.nbResults,
        getNbPlayers: (state) => state.nbPlayers,
        getPage: (state) => state.page,
        getSearch: (state) => state.search,
        isLoading: (state) => state.loading
    },
    debounce: {
        fetchPlayers: 300
    }
})
