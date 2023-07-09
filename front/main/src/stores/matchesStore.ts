import { defineStore } from 'pinia'
import { MatchResponse } from 'core/responses'
import axios from 'axios'

export const useMatchesStore = defineStore({
    id: 'matches',
    state: () => ({
        currentMatches: [] as MatchResponse[]
    }),
    actions: {
        async loadCurrentMatches() {
            return await axios
                .get(import.meta.env.VITE_MATCHES_API_URL + '?state=IN_PROGRESS')
                .then((res: { data: MatchResponse[] }) => {
                    this.$patch({
                        currentMatches: res.data
                    })

                    return res.data
                })
        },
        refreshMatch(match: MatchResponse) {
            const index = this.getCurrentMatches
                .map((m: MatchResponse) => m._id?.toString() ?? '')
                .findIndex((m: string) => m === match._id?.toString())
            if (index > -1) {
                this.$patch((state: any) => {
                    state.currentMatches[index] = match
                })
            }
        }
    },
    getters: {
        getCurrentMatches: (state): MatchResponse[] => state.currentMatches
    }
})
